import { universityModel } from "../models/universitySchema.js";
import fs from 'fs'; // File system to delete local files after upload
import cloudinary from 'cloudinary';

// University Registration Controller
export const universityRegister = async (req, res) => {
    const { universityName } = req.body;
    try {
        const existingUniversity = await universityModel.findOne({
            universityName,
            franchise_Id: req.franchise.id
        });

        if (existingUniversity) {
            return res.status(409).json({
                message: "University exist under this franchise",
            });
        }

        console.log(req.body);
        console.log(req.files);

        // Check if a university logo is uploaded
        if (!req.files.universityLogo) {
            return res.status(400).json({ message: "University logo is required." });
        }

        // Upload university logo to Cloudinary
        const logoResult = await cloudinary.v2.uploader.upload(req.files.universityLogo[0].path, { folder: 'universityLogo' });

        // Create a new university instance
        const newUniversity = new universityModel({
            universityName: req.body.universityName,
            Email: req.body.Email,
            MobileNo: req.body.MobileNo,
            franchise_Id: req.franchise.id,
            image: {
                public_id: logoResult.public_id,
                url: logoResult.secure_url,
            },
        });

        // Save the new university to the database
        await newUniversity.save();

        // Delete the local university logo file
        fs.unlink(req.files.universityLogo[0].path, (err) => {
            if (err) console.error('Error deleting local file:', err);
            else console.log('Local file deleted successfully');
        });

        return res.status(200).json({
            success: true,
            newUniversity,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Controller for  fetch University 
export const Alluniversities = async (req, res) => {
    try {
        console.log(req.franchise.id);
       
        const university = await universityModel.find({ franchise_Id: req.franchise.id });
        // console.log(university)

        // Respond with success message 
        res.status(200).json({
            success: true,
            message: "universities",
            university,
        });
    } catch (error) {
        console.log("Error in university registration:", error);
        res.status(400).json({
            message: error.message,
        });
    }
};

//particular university 
export const getuniversityDetails = async (req, res, next) => {
    try {
        const singleUniversity = await universityModel.findById(req.params.id);

        if (!singleUniversity) {
            return res.status(200).json({
                success: true,
                message: "University not found yes"
            });
        }

        if (singleUniversity.franchise_Id.toString() === req.franchise.id) {
            return res.status(200).json({
                success: true,
                singleUniversity,
            });
        } else {
            return res.status(200).json({
                success: false,
                message: "University not found"
            });
        }
    } catch (error) {
        // console.log(error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// University Update Controller
export const universityUpdate = async (req, res) => {
    try {
        const { id } = req.params; // Get university ID from the URL
        const updates = req.body;

        console.log(id)
        console.log(updates);

        if (req.files.universityLogo) {
            console.log("yes");
            // Delete the old logo from Cloudinary if necessary (you need to have the public_id stored)
            const oldUniversity = await universityModel.findById(id);
            await cloudinary.v2.uploader.destroy(oldUniversity.image.public_id); // Destroy the old image

            console.log(oldUniversity);
            // Upload new logo if provided
            const logoResult = await cloudinary.v2.uploader.upload(req.files.universityLogo[0].path, { folder: 'universityLogo' });

            updates.image = {
                public_id: logoResult.public_id,
                url: logoResult.secure_url,
            };

        }

        // Update the university document
        await universityModel.findByIdAndUpdate(id, updates, { new: true });

        return res.status(200).json({ message: "University updated successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// university delete
export const univeristydelete = async (req, res) => {
    try {
        let delUniversity = await universityModel.findById(req.params.id);
        console.log(delUniversity);
        if (!delUniversity) {
            return res.status(500).json({
                success: false,
                message: "university going to delete has not found",
            });
        }
        if (delUniversity.franchise_Id.toString() === req.franchise.id) {
            if (delUniversity.image && delUniversity.image.public_id) {
                await cloudinary.uploader.destroy(delUniversity.image.public_id);
            }

            delUniversity = await universityModel.findByIdAndDelete(
                req.params.id,
                req.body,
            );

            return res.status(200).json({
                success: true,
                message: "University deleted successfully",
            });
        } else {
            return res.status(200).json({
                success: true,
                message: "you are not allowed to delete this university"
            });
        }
    } catch (error) {
        console.log(error);
    }
}