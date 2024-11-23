import express from "express";
import { isFranchiseAuthenticated } from "../middlewares/auth.js";
import { courseCreate, deleteCourse, getCourse, getuniversityCourse, updateCourse } from "../controller/courseController.js";
const router = express.Router();

router.post('/university/:id/course/create', isFranchiseAuthenticated, courseCreate);
router.get("/all-courses", isFranchiseAuthenticated, getCourse);
router.get("/university/:id/all-courses", isFranchiseAuthenticated, getuniversityCourse);
router.put("/university/:id/course-update", isFranchiseAuthenticated, updateCourse);
router.delete("/university/course:id", isFranchiseAuthenticated, deleteCourse);

export default router;