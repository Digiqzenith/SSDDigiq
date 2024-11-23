    import { mongoose } from 'mongoose';

    const courseSchema = new mongoose.Schema({
        courseFullName: {
            type: String,
            required: [true, "Please specify courses"],
        },
        couShortName: {
            type: String,
            required: [true, "Please specify courses"],
        },
        fees: {
            type: Number,
            required: [true, "Please specify course fees "]
        },
        courseDuration: {
            type: Number,
            required: [true, "please specify the duration"],
        },
        university_id: {
            type: mongoose.Schema.ObjectId,
            ref: 'university', // Reference to the franchise
            required: true,
        },
        franchise_Id: {
            type: mongoose.Schema.ObjectId,
            ref: 'Franchise', // Reference to the franchise
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        }
    }, { timeStamps: true, })

    export const courseModel = mongoose.model("course", courseSchema);