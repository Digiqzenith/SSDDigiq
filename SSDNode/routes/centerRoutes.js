import express from "express";
import { allCenters, centerDelete, centerLogin, Centers, centersCreation, centersWallet, centerTransactionHistory, courseUniversity, getCenterWithFranchise, updatedcenterData, } from "../controller/CentersController.js";
import { isCenterAuthenticated, isFranchiseAuthenticated } from "../middlewares/auth.js";
const router = express.Router();

//center Routes
router.post("/add-center", isFranchiseAuthenticated, centersCreation);
router.post("/center-login", centerLogin);
router.get("/all-centers", isFranchiseAuthenticated, allCenters);
router.get("/centers", isFranchiseAuthenticated, Centers);
router.delete("/center/:id/delete", isFranchiseAuthenticated, centerDelete);
// router.get('/centerUnderFranchise/:id', isFranchiseAuthenticated, getCenterWithFranchise);
router.get('/centerTransactions/history', isCenterAuthenticated, centerTransactionHistory)
router.post("/wallet/request-topup", isCenterAuthenticated, centersWallet);
router.get("/center/franchise/university-courses", isCenterAuthenticated, courseUniversity)
router.get("/update/center", isCenterAuthenticated, updatedcenterData)
export default router;



// Create Razorpay Order Endpoint
// When a center initiates a payment to a franchise, we need to create a Razorpay order to process the payment.
// router.post("/create-order", checkout);   