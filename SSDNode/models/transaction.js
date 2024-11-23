import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    center: {
        type: mongoose.Schema.ObjectId,
        ref: "Centers"
    },
    studentId: {
        type: mongoose.Schema.ObjectId,
        ref: "student"
    }, 
    fullamount: { // Original transaction amount before discount
        type: Number,
        required: true
    }, 
    discountedAmount: { // Amount after applying the discount
        type: Number,
        required: true
    }, 
    discount: {  // Discount percentage
        type: Number,
        required: true
    },
    transactionType: { // 'debit' for payments to the franchise, 'credit' for refunds
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    transaction_id: { // Transaction ID (Razorpay or internal) // Razorpay payment ID
        type: String,
        required: true
    }, 
    date: { // Transaction date
        type: Date,
        default: Date.now
    }, 
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
}, { timestamps: true });

export const transactionModel = mongoose.model('transaction', transactionSchema)