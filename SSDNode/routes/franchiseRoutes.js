import express from 'express';
import { approvingTransaction, centersTransactionHistory, franchise, franchiseCreation, franchiseLogin, franchiseLogout, pendingTransactions } from "../controller/FranchiseController.js";
import { isFranchiseAuthenticated } from '../middlewares/auth.js';


const router = express.Router();

router.post('/create-franchise', franchiseCreation) //franchise register 
router.post('/franchise/login', franchiseLogin) //franchise login
router.get('/franchise', isFranchiseAuthenticated, franchise) //all franchise
router.post("/franchise-logout", franchiseLogout);

router.get('/wallet/pending-transactions', isFranchiseAuthenticated, pendingTransactions)
router.post('/master/approve-transaction', isFranchiseAuthenticated, approvingTransaction)
router.get('/master/centersTransaction/history', isFranchiseAuthenticated, centersTransactionHistory)
// router.get('/franchise/:id/centers', isAuthenticated, isAuthorize('Roles'), franchisece) 

export default router;