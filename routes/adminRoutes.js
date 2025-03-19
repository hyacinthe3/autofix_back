// Backend - routes/adminRoutes.js
import express from 'express';
import { getAllGarage, updateGarageStatus } from '../controllers/adminController.js';

const adminRouter = express.Router();

adminRouter.get('/garage', getAllGarage);
adminRouter.put('/garage/:id/status', updateGarageStatus);

export default adminRouter;
