import { config } from "dotenv";
config({ path: "./config/config.env" })
import { courseModel } from "../models/courseSchema.js";
import { studentModel } from "../models/studentRegister.js";
import fs from 'fs';
import cloudinary from 'cloudinary';
import Razorpay from 'razorpay';
// import crypto from 'crypto';
import { transactionModel } from "../models/transaction.js";
import { CentersModel } from "../models/centersSch.js";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET,
});


export const studentRegister = async (req, res) => {
    console.log("request", req.body);
    const {
        course_id,
        Gender,
        studentName,
        FatherName,
        MotherName,
        Aadhaar,
        MaritalStatus,
        EmailId,
        MobileNo,
        whatsappNo,
        Category,
        Religion,
        Address,
        nationality,
        session,
        age,
        Date_of_Birth, 
    } = req.body;
    let feeStatus = "Pending";
    try {
        // Ensure course, and center exist
        const course = await courseModel.findById(course_id);
        console.log(course);
        console.log(course._id.toString());
        
        // Step 1: Fetch the course details
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        const center = await CentersModel.findOne({ _id: req.center.id });
        // Step 2: Fetch center details (center is authenticated)
        if (!center) {
            return res.status(404).json({ success: false, message: 'Center not found' });
        }
        
        if (!Gender || !studentName || !FatherName || !MotherName || !Aadhaar ||
            !MaritalStatus || !EmailId || !MobileNo || !whatsappNo || !Category ||
            !Religion || !Address || !nationality || !session || !age || !Date_of_Birth) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            
            // Step 3: Calculate the final amount after discount
            const totalFees = course.fees;
            const discount = req.center.discount;
            const discountedAmount = totalFees * (discount / 100);
            const finalAmount = totalFees - discountedAmount;
            
            const feeInfo = {
                totalFees,
                discount,
                discountedAmount,
                finalAmount
            };
            
            // Step 5: Check if center has enough wallet balance
            if (center.wallet_balance >= finalAmount) {
                feeStatus = "Submitted";
            center.wallet_balance -= finalAmount;
            await center.save();
        }
        console.log("fees")
        console.log(totalFees)
        console.log(discount)
        console.log(discountedAmount)
        console.log(finalAmount)

        // Check if a student Profile Photo  is uploaded
        if (!req.files.studentProfilePhoto) {
            return res.status(400).json({ message: "student Profile Photo  is required." });
        }

        // Upload student Profile Photo to Cloudinary
        const profilePic = await cloudinary.v2.uploader.upload(req.files.studentProfilePhoto[0].path, { folder: 'studentProfilePhoto' });

        // Step 4: Create the student record first to get the studentId
        const newStudent = new studentModel({
            course_id: course._id.toString(),
            center_id: req.center.id,
            Gender,
            studentName,
            FatherName,
            MotherName,
            Aadhaar,
            MaritalStatus,
            EmailId,
            MobileNo,
            whatsappNo,
            Category,
            Religion,
            Address,
            nationality,
            session,
            age,
            image: {
                public_id: profilePic.public_id,
                url: profilePic.secure_url,
            },
            coursefee: totalFees,
            discountFee: finalAmount,
            feeStatus
        });

        const savedStudent = await newStudent.save(); // Save the student and get the studentId
        console.log(savedStudent);
        console.log("savedStudent");
        // Delete the local student Profile Photo file
        fs.unlink(req.files.studentProfilePhoto[0].path, (err) => {
            if (err) console.error('Error deleting local file:', err);
            else console.log('Local file deleted successfully');
        });

        
        // Step 7: Send order details to frontend for payment
        res.json({
            feeInfo,
            studentId: savedStudent._id,
            savedStudent,
            feeStatus,
            message: 'Student registered successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error registering student', error: error.message });
    }
}

export const getStudents = async (req, res) => {
    console.log('yes');
    try {
        console.log(req.center.id);

        const students = await studentModel.find({ center_id: req.center.id }).populate({
            path: 'course_id',  // Populating the course_id field
            populate: {
                path: 'university_id',
                model: 'university',
            }
        });
        console.log("students");
        console.log(students)

        // Respond with success message 
        res.status(200).json(
            // success: true,
            // message: "students",
            students,
        );
    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: error.message,
        });
    }
}

// student register by center to show franchise 
// export const getcentersStudents = async (req, res) => {
//     try{
//         console.log(req.franchise.id);
//         // Step 1: Find centers under this franchise
//         const center = await CentersModel.find({franchise_id: req.franchise.id})
//         const students = await studentModel.find({franchise_id: })
//     }
// }
export const searchStudents = async (req, res) => {
    // Students get 
    try {
        const searchKeyword = req.query.keyword || '';  // Get keyword from query parameters
        const session = req.query.session || '';  // Get session from query parameters

        // Create a dynamic filter object
        let filter = {};

        // Add conditions based on the presence of searchKeyword or session
        if (searchKeyword) {
            filter.studentName = { $regex: searchKeyword, $options: 'i' };
        }
        if (session) {
            filter.session = session;
        }

        // Perform the query with the constructed filter
        const students = await studentModel.find(filter);

        res.status(200).json(students);
    } catch (error) {
        console.log(error);
        res.status(200).json({
            message: error.message
        })
    }
}







// // Step 5: Generate Razorpay order using the saved student's ID
        // const order = await razorpay.orders.create({
        //     amount: finalAmount * 100, // Amount in paise (1 INR = 100 paise)
        //     currency: "INR",
        //     receipt: `receipt_${savedStudent._id}`, // Now use the saved student's ID
        // });
        // console.log(order);
        // const newTransaction = new transactionModel({
        //     center: req.center.id,
        //     studentId: savedStudent._id,
        //     fullamount: totalFees,
        //     discountedAmount: finalAmount,
        //     discount,
        //     transactionType: 'debit', // Debit for payments
        //     transaction_id: order.id, // Razorpay order ID
        //     status: 'pending', // Initially pending
        // })
        // await newTransaction.save();

        // console.log(newTransaction);


        
// Log to check if the environment variables are loaded
// console.log("RAZORPAY_API_KEY:", process.env.RAZORPAY_API_KEY);
// console.log("RAZORPAY_API_SECRET:", process.env.RAZORPAY_API_SECRET);