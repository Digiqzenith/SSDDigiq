import { mongoose } from 'mongoose';
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


//Franchise Schema
const franchiseSchema = new mongoose.Schema({
    name: {   //Franchise name
        type: String,
        required: true,
    },
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
    // centers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Centersmodel' }], // Array of centers under this franchise
    // Centers Array: This array stores references (ObjectId) to all centers associated with the franchise.
    // You can later use populate to retrieve details of each center when querying the franchise.
    account_balance: { type: Number, default: 0 }, // Franchise's balance
    role: {
        type: String,
        default: "franchise"
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, { timestamps: true })

franchiseSchema.pre("save", async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
})

// Method to generate JWT token for franchise
franchiseSchema.methods.getJWTToken = function () {
    return jwt.sign({ franchiseId: this._id, role: 'franchise' }, process.env.JWT_SECRET, // Secret key
        { expiresIn: process.env.JWT_EXPIRE });
}
    
//compare password
franchiseSchema.methods.comparePassword = async function (EnteredPassword) {
        return await bcrypt.compare(EnteredPassword, this.password);
}
    
export const FranchiseModel = mongoose.model('Franchise', franchiseSchema);
    
    // Explanation:
    // name: The name of the franchise.
    // centers: A list of centers associated with this franchise.
    // account_balance: The franchise’s total wallet balance, which is credited when a center pays.
    // transactions: A history of payments made by centers to the franchise.
    
    
    
    
    
    
    
    
    // Centers Array: This array stores references(ObjectId) to all centers associated
    // with the franchise.You can later use populate to retrieve details of each center when querying the franchise.
    // transactions: [{
    //     amount: Number,
    //     type: String, // 'credit' when a center pays
    //     transaction_id: String, // Razorpay payment ID
    //     center: { type: mongoose.Schema.Types.ObjectId, ref: 'Center' },
    //     timestamp: { type: Date, default: Date.now }
    // }],