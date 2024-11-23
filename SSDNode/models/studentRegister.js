import { mongoose } from 'mongoose';
import validator from 'validator';

const studentRegister = new mongoose.Schema({
    course_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'course', // Reference to the course
        required: true,
    },
    // franchise_Id: {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Franchise', // Reference to the franchise
    //     required: true,
    // },
    center_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Centers', // Reference to the center
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    Gender: {
        type: String,
        required: [true, "please specify your gender"],
    },
    studentName: {
        type: String,
        required: [true, "please specify your name"],
    },
    FatherName: {
        type: String,
        required: [true, "please specify your father name"],
    },
    MotherName: {
        type: String,
        required: [true, "please specify your name"],
    },
    Aadhaar: {
        type: String,
        required: [true, "please your adhaar no"],
        maxLength: [12, " Aadhaar No should be correct"],
        minLength: [12, " Aadhaar No should be correct"],
    },
    MaritalStatus: {
        type: String,
        required: [true, "please specify your married"],
    },
    EmailId: {
        type: String,
        required: [true, "please enter your email"],
        validator: [validator.isEmail, "please enter valid email"]
    },
    MobileNo: {
        type: String,
        required: [true, "Please specify your mobile no."],
        maxLength: [10, "phone no should be correct"],
        minLength: [10, "phone no should be correct"],
        validate: {
            validator: function (v) {
                return /^\d{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number`
        }
    },
    whatsappNo: {
        type: String,
        required: [true, "please enter your whatsapp"],
        maxLength: [10, "Whatsapp phone no should be correct"],
        minLength: [10, "whatsapp phone no should be correct"],
    },
    Category: {
        type: String,
        required: [true, "please specify your category"],
    },
    Religion: {
        type: String,
        required: [true, "please specify your religion"],
    },
    Address: {
        type: String,
        required: [true, "please specify your addresss"],
    },
    nationality: {
        type: String,
        required: [true, "please specify your nationality"],
    },
    session: {
        type: String,
        required: [true, "please specify the session"]
    },
    image: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        }
    },
    Date_of_Birth: {
        type: Date,
        required: true, // or false, depending on whether it's mandatory
        default: 22
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    coursefee: {
        type: Number,
        required: [true, "please specify the fees"]
    },
    discountFee: {
        type: Number,
        required: [true]
    },
    feeStatus: {
        type: String,
        enum: ["Pending", "Submitted"],
        default: "Pending"
    }
}, { timeStamps: true, })

export const studentModel = mongoose.model("student", studentRegister);