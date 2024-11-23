import { courseModel } from "../models/courseSchema.js";
import { universityModel } from "../models/universitySchema.js";

export const courseCreate = async (req, res, next) => {
    const { courseFullName, couShortName, fees,  courseDuration } = req.body;
    try {
        const university = await universityModel.findById(req.params.id);

        console.log("university");
        console.log(university._id);

        // check if course exist in the same university
        const courseExists = await courseModel.findOne({ courseFullName, university_id: university._id , couShortName});

        console.log(courseExists)
        console.log("courseExist")

        if (!courseFullName || !couShortName || !fees || !courseDuration) {
            res.status(201).json({ 
                message: "all fields are required"
            })
        }

        if (courseExists) {
            return res.status(404).json({
                message: "course already exist",
            });
        }

        const course = await courseModel.create({
            courseFullName,
            couShortName,
            fees,
            courseDuration,
            university_id: university._id,
            franchise_Id: req.franchise.id
        });

        console.log(course);

        res.status(200).json({
            course,
            message: "course created successfully"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: error.message
        })
    }
}

//get controller
export const getCourse = async (req, res) => {
    try {
        const course = await courseModel.find();

        console.log(course);

        return res.status(500).json({
            course,
            message: "all courses"
        })
    } catch (error) {
        console.log(error);
    }
}

//course associated with university get controller 
export const getuniversityCourse = async (req, res) => {
    try {
        const university = await universityModel.findById(req.params.id);
        console.log(university._id);
        const courses = await courseModel.find({ university_id: university._id }).populate('university_id')

        res.status(200).json({
            status: true,
            courses,
            university: courses.university_id,
            message: "courses associated with university"
        })
    } catch (error) {
        console.log(error);
    }
}

// update course
export const updateCourse = async (req, res) => {
    try {
        //find course By id
        let updateCourse = await courseModel.findById(req.params.id);

        updateCourse = await courseModel.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });

        res.status(200).json({
            message: "course updated",
            updateCourse,
        })
    } catch (error) {
        console.log(error);
    }
}

// delete course
export const deleteCourse = async (req, res) => {
    try {
        //find course By id
        let delCourse = await courseModel.findById(req.params.id);

        delCourse = await courseModel.findByIdAndDelete(req.params.id, req.body, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });

        res.status(200).json({
            success: true,
            message: "course deleted successfully",
        });
    } catch (error) {
        console.log(error);
    }
}

// courses associated with university
// export const courseswithUniversity = async(req, res) => {
//     try{
//         const coursesUniversity = await courseModel.find().populate('university_id');
//         res.status(200).json({
//             status: true,
//             coursesUniversity,
//         })
//     }catch(error){
//         console.log(error);
//     }
// }