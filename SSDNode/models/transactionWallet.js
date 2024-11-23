import mongoose, { mongo } from 'mongoose';

const transactionWalletSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true,
    },
    centerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Centers',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    approvedBy: {  // ID of the master who approved it
        type: mongoose.Schema.ObjectId,
        ref: 'Franchise',
        default: null,
    },
    approvedAt: {  // Timestamp of the approval
        type: Date,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

export const walletTransaction = mongoose.model("walletTransaction", transactionWalletSchema)