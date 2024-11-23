import express from "express";
import { uploadUniversityFiles } from "../middlewares/multer.js";
import { Alluniversities, getuniversityDetails, univeristydelete, universityUpdate, universityRegister } from "../controller/universityController.js";
import { isFranchiseAuthenticated } from "../middlewares/auth.js";
const router = express.Router();


router.post('/university/register', isFranchiseAuthenticated, uploadUniversityFiles, universityRegister);
router.get('/all-university', isFranchiseAuthenticated, Alluniversities);
router.get('/university-details/:id', isFranchiseAuthenticated, getuniversityDetails);
router.put('/university/:id', isFranchiseAuthenticated, uploadUniversityFiles, universityUpdate); // Route to update the university, including handling file uploads for universityLogo
router.delete('/university-delete/:id', isFranchiseAuthenticated, univeristydelete);
export default router;
 