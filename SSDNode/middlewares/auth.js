import jwt from 'jsonwebtoken';
import { FranchiseModel } from '../models/franchiseSchema.js';
import { CentersModel } from '../models/centersSch.js';

export const isFranchiseAuthenticated = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Authorization token is missing or invalid." });
        }

        const token = authHeader.split(" ")[1];

        // const { token } = req.cookies;
        console.log(token);
        console.log('hello')

        if (!token) {
            return res.status(400).json({ message: "please login to access this resource" })
        }

        const decodedData = jwt.verify(token, process.env.JWT_SECRET)
        console.log(decodedData);
        console.log("hello man");

        if (decodedData.franchiseId) {
            req.franchise = await FranchiseModel.findById(decodedData.franchiseId);
            next();
        } else {
            return
        }

    } catch (error) {
        console.log(error);
    }
}


export const isCenterAuthenticated = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Authorization token is missing or invalid." });
        }

        const token = authHeader.split(" ")[1];

        // const { token } = req.cookies;
        console.log(token);

        if (!token) {
            return res.status(400).json({ message: "please login to access this resource" })
        }

        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decodedData);

        req.center = await CentersModel.findById(decodedData.centerId);
        console.log(req.center);
        console.log("req.center");

        next();
    } catch (error) {
        console.log(error);
    }
}

// export const authorizeRoles = (...roles) => {
//     return (req, res, next) => {
//         if (!roles.includes(req.franchise.role)) {
//             return res.status(400).json({ message: `Role  ${req.franchise.role} is not allowed to access this resource` })
//         }
//         next();
//     }
// }