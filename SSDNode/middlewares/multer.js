import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v4 as uuidv4 } from 'uuid';
import pkg from 'cloudinary'; // Import the package as a whole
const { v2: cloudinary } = pkg; // Destructure to get v2

//  Configure Cloudinary
cloudinary.config({
    cloud_name: "dkqug51rv",
    api_key: 298748942386567,
    api_secret: "1lloUDb9GHLE86xZCkAeOe6x2Ro",
})


// Multer storage configuration for local files
const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads'); // Temporary storage
    },
    filename: function (req, file, cb) {
        const random = uuidv4();
        cb(null, random + '-' + file.originalname);
    }
});

// Multer middleware for uploading university logo and student profile photo
const localUploads = multer({
    storage: diskStorage,
}).fields([
    { name: "universityLogo", maxCount: 1 },
    { name: "studentProfilePhoto", maxCount: 1 }
]);

// Cloudinary storage for university logo
const universityLogoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'universityLogo',
        public_id: (req, file) => uuidv4(),
    },
});

// Cloudinary storage for student profile photo
const studentProfileStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'studentProfilePhoto',
        public_id: (req, file) => uuidv4(),
    },
});

// Middleware to handle uploads
export const uploadUniversityFiles = localUploads;
export const uploadStudentFiles = localUploads; 
