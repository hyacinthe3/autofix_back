import express from 'express';
import { getPendingGarages, approveGarage, rejectGarage } from '../controllers/adminController.js';

const router = express.Router();

// Get all pending garages
router.get('/garages/pending', getPendingGarages);

// Approve a garage by ID
router.put('/garages/:id/approve', approveGarage);

// Reject a garage by ID
router.put('/garages/:id/reject', rejectGarage);

export default router;
