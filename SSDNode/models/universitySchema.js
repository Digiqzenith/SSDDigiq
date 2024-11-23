import { mongoose } from "mongoose";
import validator from 'validator';

const UniversitySchema = new mongoose.Schema({
    universityName: {
        type: String,
        required: [true, "please specify your universityName"]
    },
    Email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        validate: [validator.isEmail, "Please enter a valid email"]
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
    franchise_Id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Franchise', // Reference to the franchise
        required: true,
    },
    image: {
        public_id
            : {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timeStamps: true })
export const universityModel = mongoose.model("university", UniversitySchema);