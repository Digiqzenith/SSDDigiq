import express from 'express';
import { getStudents, searchStudents, studentRegister } from '../controller/StudentController.js';
import { isCenterAuthenticated } from '../middlewares/auth.js';
import { uploadStudentFiles } from '../middlewares/multer.js';
// import { uploadStudentFiles } from '../middlewares/multer.js';
const router = express.Router();

router.post('/registerStudent', isCenterAuthenticated, uploadStudentFiles, studentRegister);
// router.post("/paymentVerification", paymentVerification);
router.get('/all-students', isCenterAuthenticated, getStudents);
router.get('/search-students', isCenterAuthenticated, searchStudents);
export default router;

// /670a6e8b0761b2f0e99ab56b/university/670818ea464d5b8e3cb65d29/center
// /:id/university/:id/center
// uploadStudentFiles,