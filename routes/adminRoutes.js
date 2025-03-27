// Backend - routes/adminRoutes.js
import express from 'express';
import { getAllGarage, updateGarageStatus,adminLogin } from '../controllers/adminController.js';
// import adminAuth from "../middleware/adminMiddleware.js";
const adminRouter = express.Router();

adminRouter.post("/adminlogin", adminLogin);
adminRouter.get('/garage', getAllGarage);
adminRouter.put('/garage/:id/status', updateGarageStatus);


export default adminRouter;

