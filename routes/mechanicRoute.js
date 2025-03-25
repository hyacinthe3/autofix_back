// routes/mechanicRoutes.js
import express from 'express';
import authMiddleware from "../middleware/authMiddleware.js";
import Mechanic from "../models/mechanicModel.js";
import {getMechanicById,deleteMechanicById,updateMechanicById,} from '../controllers/mechanicController.js';

const mechanicRoutes = express.Router();

mechanicRoutes.post("/register", authMiddleware, async (req, res) => {
  try {
      const { fullName, phoneNumber, specialisation } = req.body;

      if (!req.user) {
          return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const garageId = req.user.id; // Get logged-in garage ID

      const newMechanic = new Mechanic({
          fullName,
          phoneNumber,
          specialisation,
          garageId, // Assign mechanic to the logged-in garage
      });

      await newMechanic.save();
      res.status(201).json({ success: true, message: "Mechanic registered successfully!" });
  } catch (error) {
      console.error("Error registering mechanic:", error);
      res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

mechanicRoutes.get("/all", authMiddleware, async (req, res) => {
  try {
      if (!req.user) {
          return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const garageId = req.user.id; // Get logged-in garage ID
      const mechanics = await Mechanic.find({ garageId }); // Fetch only mechanics of this garage

      res.status(200).json(mechanics);
  } catch (error) {
      console.error("Error fetching mechanics:", error);
      res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});


mechanicRoutes.get('/:id',authMiddleware, getMechanicById);

mechanicRoutes.delete('/:id', authMiddleware,deleteMechanicById);
mechanicRoutes.put('/:id', authMiddleware,updateMechanicById);

export default mechanicRoutes;
