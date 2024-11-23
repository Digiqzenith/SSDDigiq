import multer from "multer";
import { v4 as uuidv4 } from 'uuid';
import { CloudinaryStorage } from "multer-storage-cloudinary";
import fs from 'fs';
import pkg from 'cloudinary'; // Import the package as a whole
const { v2: cloudinary } = pkg; // Destructure to get v2

// Configure Cloudinary
cloudinary.config({
    cloud_name: "dkqug51rv",
    api_key: 298748942386567,
    api_secret: "1lloUDb9GHLE86xZCkAeOe6x2Ro",
})

// Step 1: Multer's disk storage for local storage in 'uploads'
const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads') // store file temporary in uploads folder
    },
    filename: function (req, file, cb) {
        const random = uuidv4();
        cb(null, random + '-' + file.originalname)
    }
})

// multer middleware for localStorage
const localuploads = multer({
    storage: diskStorage,
    // limits: { fileSize: 500000 }, // Limit file size to 500KB

}).fields([{ name: "passportPhoto", maxCount: 1 },
{ name: "subhartiPhoto", maxCount: 1 }
])

// Step 2: Cloudinary Storage for Form 1 (Manglayatan)
const storageForm1 = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'SSDSTUDENTS',
        // format: async () => 'png',  // Force PNG format
        public_id: () => uuidv4(),  // Use UUID for filenames
    },
});


// Step 3: Cloudinary Storage for Form 2 (Subharti)
const storageForm2 = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'SUBHARTISTUDENTS',
        // format: async () => 'jpg',  // Force JPG format
        public_id: () => uuidv4(),  // Use UUID for filenames
    },
});



// Middleware for Form 1 (Manglayatan)
export const uploadManglayatan = (req, res, next) => {
    localuploads(req, res, async function (err) {
        if (err) return res.status(400).send(err.message);

        // Upload to Cloudinary
        const localFilePath = req.files.passportPhoto[0].path;
        console.log(localFilePath);
        try {
            // const result = await v2.uploader.upload(localFilePath, { folder: 'SSDSTUDENTS' });
            const result = await cloudinary.uploader.upload(localFilePath, { folder: 'SSDSTUDENTS' });
            // Store Cloudinary URL and public ID in req.body
            req.body.image = {
                public_id: result.public_id,
                url: result.secure_url,
            };

            // Delete the local file
            fs.unlink(localFilePath, (err) => {
                if (err) console.error('Error deleting local file:', err);
                else console.log('Local file deleted successfully');
            });

            // Proceed to next middleware/controller
            next();
        } catch (uploadError) {
            return res.status(500).json({ message: 'Cloudinary upload failed', error: uploadError.message });
        }
    });
};

// Middleware for Form 2 (Subharti)
export const uploadSubharti = (req, res, next) => {
    localuploads(req, res, async function (err) {
        if (err) return res.status(400).send(err.message);

        // Upload to Cloudinary
        const localFilePath = req.files.subhartiPhoto[0].path;
        console.log(localFilePath);
        try {
            const result = await cloudinary.uploader.upload(localFilePath, { folder: "SUBHARTISTUDENTS" })
            // Store Cloudinary URL and public ID in req.body
            req.body.image = {
                public_id: result.public_id,
                url: result.secure_url,
            };

            // Delete the local file
            fs.unlink(localFilePath, (err) => {
                if (err) console.error('Error deleting local file:', err);
                else console.log('Local file deleted successfully');
            });

            // Proceed to next middleware/controller
            next();
        } catch (uploadError) {
            return res.status(500).json({ message: 'Cloudinary upload failed', error: uploadError.message });
        }
    });
};



























// Check file type (only images)
// function checkFileType(file, cb) {
//     const filetypes = /jpeg|jpg|png/;
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = filetypes.test(file.mimetype);

//     if (mimetype && extname) {
//         return cb(null, true);
//     } else {
//         cb('Error: Images Only!');
//     }
// }