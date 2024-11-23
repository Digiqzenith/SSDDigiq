import { mongoose } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from 'validator';

const centerSchema = new mongoose.Schema({
    centerId: {
        type: String,
        required: true,
    },
    centerName: {
        type: String,
        required: [true, "please enter your name"],
        maxLength: [30, "Name cannot exceed 30 characters"],
        minLength: [4, "Name should have more than 4 characters"],
        // validate: {
        //     validator: function (v) {
        //         return /^[a-zA-Z\s]+$/.test(v); // Custom regex validator for letters and spaces
        //     },
        //     message: props => `${props.value} is not a valid name! Name should only contains letter and spaces`
        // }
    }, // Center name
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        validate: [validator.isEmail, "Please enter a valid email"]
    },    
    password: {
        type: String,
        required: [true, "please enter your password"],
        maxLength: [10, "Password cannot be greater than 10 characters"],
        minLength: [8, "Password should be greater than 8 characters"],
        select: false,
    },
    MobileNo: {
        type: Number,
        required: [true, "please enter your phone number"],
        maxLength: [10, "Phone no should be correct"],
        minLength: [10, "phone no should correct"],
        validate: {
            validator: function (v) {
                return /^\d{10}$/.test(v); // Ensure exactly 10 digits
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    discount: {
        type: Number,
        required: true,
    },
    wallet_balance: {
        type: Number,
        default: 0,
    },  // Center's wallet balance
    franchise_Id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Franchise', // Reference to the franchise
        required: true,
    },
    role: {
        type: String,
        default: "center"
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, { timestamps: true })

// Pre-save hook to hash the password before saving  // pre ek event hai
centerSchema.pre("save", async function (next) {
    //if password phle se hash hai to modiefied nhi krenge
    if (!this.isModified("password")) {
        return next();
    }
    // const salt = await bcrypt.genSalt(10)
    // this.password = await bcrypt.hash(this.password, salt);
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// token generation 
centerSchema.methods.getJWTToken = function () {
    return jwt.sign({ centerId: this._id, role: 'Centers' }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

//compare password
centerSchema.methods.comparePassword = async function (EnteredPassword) {
    return await bcrypt.compare(EnteredPassword, this.password)
};

export const CentersModel = mongoose.model('Centers', centerSchema);


// Explanation:
// name: The name of the center.
// franchise_id: The franchise this center is associated with.
// wallet_balance: The amount of money available in the center’s wallet.
// transactions: A history of payments made by the center, including transaction details.


// Transactions: This array will log each transaction (credit/debit) associated with the center.
// Wallet Balance: The balance is stored here, and is adjusted when payments are made.

// Franchise Reference: The franchise_id links the center to its parent franchise.
// transactions: [
//     {
//         amount: { type: Number, required: true }, // Transaction amount
//         type: { type: String, enum: ['credit', 'debit'], required: true },// 'debit' for payments to the franchise
//         transaction_id: { type: String, required: true }, // Transaction ID (Razorpay or internal) // Razorpay payment ID
//         date: { type: Date, default: Date.now } // Transaction date
//     }
// ],