import { CentersModel } from '../models/centersSch.js';
import { FranchiseModel } from '../models/franchiseSchema.js';
import { transactionModel } from '../models/transaction.js';
import { walletTransaction } from '../models/transactionWallet.js';
import { sendToken } from "../utils/tokenGenrator.js"

// The Franchise schema will store details about the franchise
export const franchiseCreation = async (req, res) => {
    const { name, email, password, MobileNo } = req.body
    try {
        const franchise = new FranchiseModel({ name, email, password, MobileNo });
        await franchise.save();

        sendToken(franchise, 201, res, "franchise created successfully");

    } catch (error) {
        console.log(error);
        res.status(300).json({
            message: error.message
        })
    }
}

//franchise login
export const franchiseLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            res.status(401).json({
                message: "please enter emailId and Password field"
            })
        }
        const franchise = await FranchiseModel.findOne({ email }).select("+password");
        console.log(franchise);

        if (!franchise) {
            return res.status(401).json({ message: "Invalid centerId or password" });
        }

        const isPasswordMatched = await franchise.comparePassword(password);
        console.log(isPasswordMatched);

        if (!isPasswordMatched) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        sendToken(franchise, 201, res, "Login successfully");
    } catch (error) {
        console.log(error);
    }
}
// get franchise
export const franchise = async (req, res) => {
    try {
        const franchise = await FranchiseModel.find();
        console.log(franchise);
        res.json({
            message: "franchise",
            franchise: franchise
        })
    } catch (error) {
        console.log(error);
    }
}

// franchise logout 
export const franchiseLogout = async (req, res, next) => {
    try {
        res.cookie('token', null, {
            expires: new Date(Date.now()),
            httpOnly: true,
        })
        res.status(200).json({
            status: 'success',
            message: "logout successfully"
        })
    } catch (error) {
        console.log(error);
    }
}

// Master to View Transactions either pending, rejected or accepted  
export const pendingTransactions = async (req, res) => {
    try {
        // console.log(req.franchise.id);
        const centers = await CentersModel.find({ franchise_Id: req.franchise.id });

        const centerIds = centers.map(center => center._id);
        console.log(centerIds);

        const pendingTransactions = await walletTransaction.find({
            centerId: { $in: centerIds },
            // status: "pending"  // This ensures the filter includes only pending transactions
        })
            .populate('centerId')

        res.status(200).json({ pendingTransactions });
    } catch  (error) {
        res.status(500).json({ message: error.message });
    }
}

// Approving or Rejecting Transactions by the Master
export const approvingTransaction = async (req, res) => {
    try {
        const { transactionId, approved } = req.body;

        const transaction = await walletTransaction.findOne({ transactionId }).populate('centerId');
        console.log(transaction);

        console.log(transaction.centerId.franchise_Id);
        console.log(req.franchise.id);

        if (transaction.status == 'pending') {
            // Check if the center is under the master’s control
            if (transaction.centerId.franchise_Id.toString() !== req.franchise.id) {
                return res.status(403).json({ message: "Unauthorized to approve this transaction" });
            }

            if (approved == 'approved') {
                transaction.status = 'approved';
                transaction.approvedBy = req.franchise.id;
                const date = new Date();
                transaction.approvedAt = date.toLocaleString('en-IN')

                const center = await CentersModel.findById(transaction.centerId._id);
                center.wallet_balance += transaction.amount;
                await center.save();

            } else {
                transaction.status = 'rejected';
            }
        } else if (transaction.status == 'approved') {
            return res.status(400).json({ message: "Invalid or already processed transaction" });
        }

        await transaction.save();

        const updatedTransaction = await walletTransaction.findById(transaction._id).populate('centerId');
        res.status(200).json({ message: `Transaction ${approved ? 'approved' : 'rejected'}`, updatedTransaction });
    } catch (error) {
        console.log(error.message)
    }
}

// all centers transaction history comes under franchise 
export const centersTransactionHistory = async (req, res) => {
    try {
        // step 1 all centers associated with these franchise
        const centers = await CentersModel.find({ franchise_Id: req.franchise.id });

        console.log(centers);

        const centerIds = centers.map(center => center._id);

        // find transaction history of all centers 
        const cenTransHistory = await walletTransaction.find({ centerId: { $in: centerIds } }).populate('centerId')

        res.status(200).json({
            success: true,
            cenTransHistory
        })
    } catch (error) {
        console.log(error)
    }
}

