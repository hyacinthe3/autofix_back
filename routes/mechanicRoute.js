// routes/mechanicRoutes.js
import express from 'express';
import {registerMechanic,getAllMechanics,getMechanicById,deleteMechanicById,updateMechanicById,} from '../controllers/mechanicController.js';

const mechanicRoutes = express.Router();

mechanicRoutes.post('/register', registerMechanic);
mechanicRoutes.get('/all', getAllMechanics);  // ✅ Change '/' to '/all'
mechanicRoutes.get('/:id', getMechanicById);

mechanicRoutes.delete('/:id', deleteMechanicById);
mechanicRoutes.put('/:id', updateMechanicById);

export default mechanicRoutes;
