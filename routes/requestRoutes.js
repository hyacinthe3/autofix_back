import express from "express";
import mongoose from "mongoose";
import Request from "../models/Request.js";
import Garage from "../models/garageModel.js";
import haversine from "haversine-distance";

const requestRoutes = express.Router();

// Create a new request
requestRoutes.post("/send", async (req, res) => {
  try {
    const { carIssue, carModel, location, contact } = req.body;
    
    // Check if location and coordinates exist
    if (!location || !location.coordinates || location.coordinates.length !== 2) {
      return res.status(400).json({ success: false, message: "Valid location coordinates are required (longitude, latitude)" });
    }

    // Create and save new request
    const newRequest = new Request({ carIssue, carModel, location, contact });
    await newRequest.save();

    // Find nearest garages
    const garages = await Garage.find();
    const garagesWithDistance = garages.map((garage) => {
      if (!garage.location || !garage.location.coordinates || garage.location.coordinates.length !== 2) {
        return null; // Skip garages with invalid locations
      }
      const distance = haversine(location.coordinates, garage.location.coordinates) / 1000; // in km
      return { ...garage.toObject(), distance };
    }).filter((garage) => garage !== null); // Remove any invalid garages

    // Sort garages by distance
    garagesWithDistance.sort((a, b) => a.distance - b.distance);

    res.status(201).json({ success: true, message: "Request sent successfully!", nearestGarages: garagesWithDistance });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Error sending request", error: error.message });
  }
});





requestRoutes.get("/all", async (req, res) => {
    try {
      const requests = await Request.find().populate("assignedGarage"); // ✅ Populate garage info
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Error fetching requests", error: error.message });
    }
  });

  



requestRoutes.post("/assign", async (req, res) => {
    try {
      const { garageId, carIssue, carModel, location, contact } = req.body;
  
      // Ensure all fields exist
      if (!garageId || !carIssue || !carModel || !location || !contact) {
        return res.status(400).json({ success: false, message: "All fields are required" });
      }
  
      // ✅ Convert garageId to ObjectId before querying
      if (!mongoose.Types.ObjectId.isValid(garageId)) {
        return res.status(400).json({ success: false, message: "Invalid garage ID format" });
      }
      const garage = await Garage.findById(new mongoose.Types.ObjectId(garageId));
  
      if (!garage) {
        return res.status(404).json({ success: false, message: "Garage not found" });
      }
  
      // Save request with assigned garage
      const assignedRequest = new Request({
        carIssue,
        carModel,
        location,
        contact,
        assignedGarage: garageId, // Store the valid ObjectId
      });
  
      await assignedRequest.save();
  
      res.status(201).json({ success: true, message: "Request assigned successfully!" });
    } catch (error) {
      console.error("Error assigning request:", error);
      res.status(500).json({ success: false, message: "Error assigning request", error: error.message });
    }
  });




requestRoutes.post("/accept", async (req, res) => {
  try {
    const { requestId, garageId } = req.body;
    console.log("Request body:", req.body); // Add this log to inspect the request data

    if (!requestId || !garageId) {
      return res.status(400).json({ success: false, message: "Request ID and Garage ID are required" });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(requestId) || !mongoose.Types.ObjectId.isValid(garageId)) {
      return res.status(400).json({ success: false, message: "Invalid request or garage ID format" });
    }

    // Find request and update status
    const updatedRequest = await Request.findByIdAndUpdate(
      requestId,
      { status: "accepted", assignedGarage: garageId },
      { new: true }
    ).populate("assignedGarage");

    if (!updatedRequest) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    res.json({ success: true, message: "Request accepted successfully", request: updatedRequest });
  } catch (error) {
    console.error("Error accepting request:", error);
    res.status(500).json({ success: false, message: "Error accepting request", error: error.message });
  }
});

// ✅ Reject Request
requestRoutes.post("/reject", async (req, res) => {
  try {
    const { requestId } = req.body;

    if (!requestId) {
      return res.status(400).json({ success: false, message: "Request ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ success: false, message: "Invalid request ID format" });
    }

    // Remove request from database
    const deletedRequest = await Request.findByIdAndDelete(requestId);

    if (!deletedRequest) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    res.json({ success: true, message: "Request rejected successfully" });
  } catch (error) {
    console.error("Error rejecting request:", error);
    res.status(500).json({ success: false, message: "Error rejecting request", error: error.message });
  }
});


requestRoutes.get("/garages/:garageId/mechanics", async (req, res) => {
    try {
      const { garageId } = req.params;
      const mechanics = await Mechanic.find({ garage: garageId });
      res.json(mechanics);
    } catch (error) {
      res.status(500).json({ success: false, message: "Error fetching mechanics" });
    }
  });

  

  requestRoutes.post("/assign-mechanic", async (req, res) => {
    try {
      const { requestId, mechanicId } = req.body;
  
      if (!requestId || !mechanicId) {
        return res.status(400).json({ success: false, message: "Request ID and Mechanic ID are required" });
      }
  
      const updatedRequest = await Request.findByIdAndUpdate(
        requestId,
        { assignedMechanic: mechanicId, status: "mechanic_assigned" },
        { new: true }
      ).populate("assignedMechanic");
  
      if (!updatedRequest) {
        return res.status(404).json({ success: false, message: "Request not found" });
      }
  
      res.json({ success: true, message: "Mechanic assigned successfully", mechanic: updatedRequest.assignedMechanic });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error assigning mechanic" });
    }
  });
  
export default requestRoutes;