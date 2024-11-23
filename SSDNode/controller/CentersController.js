import { CentersModel } from "../models/centersSch.js";
import { studentModel } from "../models/studentRegister.js";
// import { FranchiseModel } from "../models/franchiseSchema.js";
import { sendCenterToken } from "../utils/tokenGenrator.js";
import validator from 'validator';
import { walletTransaction } from "../models/transactionWallet.js";
import { universityModel } from "../models/universitySchema.js";
import { courseModel } from "../models/courseSchema.js";

//Creating the Relationship Between Franchise and Center
// create a new center under a franchise:

export const centersCreation = async (req, res, next) => {
    const { centerName, email, password, centerId, MobileNo, discount } = req.body;
    try {
        // console.log(req.franchise);

        if (!centerName || !email || !password || !centerId || !MobileNo) {
            res.status(201).json({
                message: "all fields are required"
            })
        }

        // Check if the center already exists in the same franchise
        const existingCenter = await CentersModel.findOne({
            centerId,
            franchise_Id: req.franchise.id
        });

        if (existingCenter) {
            return res.status(409).json({
                message: "Center with this ID is already registered under this franchise",
            });
        }
        if (!validator.isEmail(email)) {
            return res.status(404).json({
                message: "Invalid email format",
            });
        }

        if (!email.endsWith("@gmail.com")) {
            return res.status(404).json({
                message: "Only Gmail addresses are allowed",
            });
        }

        const center = await CentersModel.create({
            centerId,
            centerName,
            email,
            password,
            MobileNo,
            discount,
            franchise_Id: req.franchise.id
        });
        res.status(201).json({
            center,
            message: "registered successfully"
        })
        // console.log(center);
        // sendCenterToken(center, 201, res, "registered successfully");

    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: error.message
        })
    }
}

//centers Login
export const centerLogin = async (req, res, next) => {
    const { centerId, password } = req.body
    try {
        if (!centerId || !password) {
            res.status(401).json({
                message: "please enter centerId and Password field"
            })
        }
        const center = await CentersModel.findOne({ centerId }).select("+password");
        console.log(center);


        if (!center) {
            return res.status(401).json({ message: "Invalid centerId or password" });
        }

        const isPasswordMatched = await center.comparePassword(password);
        console.log(isPasswordMatched);

        if (!isPasswordMatched) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        sendCenterToken(center, 201, res, "Login successfully");
    } catch (error) {
        console.log(error);
    }
}

// centers get also their students associated with them 
export const allCenters = async (req, res) => {
    try {
        console.log('data');
        // Step 1: Find centers under this franchise
        const centers = await CentersModel.find({ franchise_Id: req.franchise.id }); //which franchise registered center

        // Extract all center IDs into an array
        const centerIds = centers.map(center => center._id);
        console.log(centerIds);

        // Step 2: Find students associated with these center IDs
        const students = await studentModel.find({ center_id: { $in: centerIds } }).populate({
            path: 'course_id',  // Populating the course_id field
            populate: {
                path: 'university_id',
                model: 'university',
            }
        }).populate({
            path: 'center_id',
            populate: {
                path: 'franchise_Id',
                model: 'Franchise'
            }
        })
        console.log('Associated Students:', students);

        res.status(200).json({
            centers,
            students
        })
    } catch (error) {
        console.log(error);
        res.status(200).json({
            message: error.message
        })
    }
}

export const Centers = async (req, res) => {
    try {
        const centers = await CentersModel.find();  //all centers
        res.status(200).json({
            centers,
        })
    } catch (error) {
        console.log(error);
        res.status(200).json({
            message: error.message
        })
    }
}

export const centerDelete = async (req, res) => {
    try {
        let centerDel = await CentersModel.findById(req.params.id);

        centerDel = await CentersModel.findByIdAndDelete(req.params.id, req.body, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        })

        res.status(200).json({
            success: true,
            message: "center deleted successfully",
        });
    } catch (error) {
        console.log(error);
    }
}
// under which franchise center come

// Controller to fetch a specific center and the franchise that registered it
export const getCenterWithFranchise = async (req, res) => {
    try {
        const centerId = req.params.id; // Get center ID from request parameters

        // Find the center and populate the franchise details
        const center = await CentersModel.findById(centerId).populate('franchise_Id');

        if (!center) {
            return res.status(404).json({
                success: false,
                message: "Center not found"
            });
        }

        // If franchise exists, it will be populated
        res.status(200).json({
            success: true,
            center,
            franchise: center.franchise_Id // franchise information
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching the center and franchise",
            error: error.message
        });
    }
};

// centers wallet 
export const centersWallet = async (req, res) => {
    try {
        console.log(req.body);
        console.log(req.center.id);
        const { amount, transactionId } = req.body;
        // Ensure the transactionId is unique
        const existingTransaction = await walletTransaction.findOne({ transactionId })

        if (existingTransaction) {
            return res.status(400).json({ message: "Transaction ID already exists" });
        }

        // Create the new transaction with "pending" status
        const transaction = await walletTransaction.create({
            transactionId,
            centerId: req.center.id,
            amount,
            status: "pending",  // Default status
        });

        res.status(200).json({ message: "Top-up request sent for approval", transaction });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//center transaction history 
export const centerTransactionHistory = async (req, res) => {
    try {
        const transactions = await walletTransaction.find({ centerId: req.center.id }).sort({ createdAt: -1 }).populate({
            path: 'centerId',  // Populating the course_id field
            populate: {
                path: 'franchise_Id',
                model: 'Franchise',
            }
        });

        res.status(200).json(transactions);
    } catch (error) {
        console.log(error)
    }
}

// get courses and universities 
export const courseUniversity = async (req, res) => {
    try {
        const centerdata = await CentersModel.findOne({ _id: req.center.id });

        const universities = await universityModel.find({ franchise_Id: centerdata.franchise_Id });
     

        const universityIds = universities.map(universities => universities._id);


        const courses = await courseModel.find({ university_id: { $in: universityIds } }).populate('university_id', 'universityName')  // Populate only the university name
            .select('couShortName fees university_id');

        res.status(201).json({
            sucess: true,
            data: {
                center: centerdata,
                universities,
                courses
            }
        })
    } catch (error) {
        console.log(error);
    }
}

export const updatedcenterData = async (req, res) => {
    try {
        const center = await CentersModel.findOne({ _id: req.center.id });
        res.status(201).json({
            message: true,
            center
        })
    } catch (error) {
        console.log(error)
    }
}
// Create Razorpay Order Endpoint
// export const checkout = async (req, res) => {
//     const { amount, currency, center_id } = req.body

//     const options = {
//         amount: amount * 100, //convert to paise // Amount in paise (Razorpay accepts amounts in paise)
//         currency: 'INR',
//         receipt: `receipt_order_${Date.now()}`
//     }
//     try {
//         const order = await Razorpay.orders.create(options);   // Create Razorpay order
//         res.json({
//             order,
//             center_id
//         })
//     } catch (error) {
//         console.log(error);
//         res.status().json({
//             error: error.message
//         })
//     }
// }



// Explanation:
// We get the center making the payment using center_id.
// A Razorpay order is created with the amount to be paid.
// The response includes the Razorpay order details and the center ID, which will be used on the frontend to complete the payment.