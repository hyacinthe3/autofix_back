import express from "express";
import mongoose from "mongoose";
import axios from "axios";
import Request from "../models/Request.js";
import Garage from "../models/garageModel.js";
import haversine from "haversine-distance";
import Mechanic from "../models/mechanicModel.js";
import cors from "cors"; // Enable CORS

const requestRoutes = express.Router();
requestRoutes.use(cors()); // Allow cross-origin requests

// Function to get address from coordinates
const getAddressFromCoordinates = async (lat, lon) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );
    return response.data.display_name || "Unknown Location";
  } catch (error) {
    console.error("Error fetching address:", error);
    return "Unknown Location";
  }
};

// Create a new request
requestRoutes.post("/send", async (req, res) => {
  try {
    const { carIssue, carModel, location, contact } = req.body;

    if (!location || !location.coordinates || location.coordinates.length !== 2) {
      return res.status(400).json({ success: false, message: "Valid location coordinates are required" });
    }

    const address = await getAddressFromCoordinates(location.coordinates[1], location.coordinates[0]);
    const newRequest = new Request({ carIssue, carModel, location: { coordinates: location.coordinates, address }, contact });
    await newRequest.save();

    const garages = await Garage.find({ approvalStatus: 'approved' });
    const garagesWithDistance = garages.map((garage) => {
      if (!garage.location || !garage.location.coordinates || garage.location.coordinates.length !== 2) {
        return null;
      }
      const distance = haversine(location.coordinates, garage.location.coordinates) / 1000;
      return { ...garage.toObject(), distance };
    }).filter(garage => garage !== null);

    garagesWithDistance.sort((a, b) => a.distance - b.distance);

    res.status(201).json({ success: true, message: "Request sent successfully!", nearestGarages: garagesWithDistance, requestId: newRequest._id });
  } catch (error) {
    console.error("Error sending request:", error);
    res.status(500).json({ success: false, message: "Error sending request" });
  }
});

// Assign request to a garage
requestRoutes.post("/assign", async (req, res) => {
  try {
    const { garageId, carIssue, carModel, location, contact } = req.body;
    if (!garageId || !carIssue || !carModel || !location || !contact) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(garageId)) {
      return res.status(400).json({ success: false, message: "Invalid garage ID format" });
    }
    const garage = await Garage.findById(garageId);
    if (!garage) {
      return res.status(404).json({ success: false, message: "Garage not found" });
    }
    const address = await getAddressFromCoordinates(location.coordinates[1], location.coordinates[0]);
    const assignedRequest = new Request({ carIssue, carModel, location: { coordinates: location.coordinates, address }, contact, assignedGarage: garageId });
    await assignedRequest.save();
    res.status(201).json({ success: true, message: "Request assigned successfully!", requestId: assignedRequest._id });
  } catch (error) {
    console.error("Error assigning request:", error);
    res.status(500).json({ success: false, message: "Error assigning request" });
  }
});

// Get all requests for a garage
requestRoutes.get("/garages/:garageId/requests", async (req, res) => {
  try {
    const { garageId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(garageId)) {
      return res.status(400).json({ success: false, message: "Invalid garage ID" });
    }
    const requests = await Request.find({ assignedGarage: garageId }).populate("assignedGarage").populate("assignedMechanic").exec();
    res.json({ success: true, requests });
  } catch (error) {
    console.error("Error fetching garage requests:", error);
    res.status(500).json({ success: false, message: "Error fetching requests" });
  }
});

// Get all mechanics for a garage
requestRoutes.get("/garages/:garageId/mechanics", async (req, res) => {
  try {
    const { garageId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(garageId)) {
      return res.status(400).json({ success: false, message: "Invalid garage ID" });
    }
    const mechanics = await Mechanic.find({ garageId });
    res.json({ success: true, mechanics });
  } catch (error) {
    console.error("Error fetching mechanics:", error);
    res.status(500).json({ success: false, message: "Error fetching mechanics" });
  }
});

// Assign mechanic to a request
requestRoutes.post("/assign-mechanic", async (req, res) => {
  try {
    const { requestId, mechanicId } = req.body;
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }
    const mechanic = await Mechanic.findById(mechanicId);
    if (!mechanic) {
      return res.status(404).json({ success: false, message: "Mechanic not found" });
    }
    request.assignedMechanic = mechanicId;
    request.status = "Assigned";
    request.assignedAt = new Date();
    await request.save();
    res.status(200).json({ success: true, message: "Mechanic assigned successfully" });
  } catch (error) {
    console.error("Error assigning mechanic:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});




requestRoutes.put('/complete/:id', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).send('Request not found');
    }

    request.status = 'Completed';
    await request.save();
    res.status(200).send({ success: true, message: 'Request marked as completed' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});


requestRoutes.get("/requests/:requestId/mechanic", async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findById(requestId).populate("assignedMechanic");

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (!request.assignedMechanic) {
      return res.status(404).json({ success: false, message: "No mechanic assigned to this request" });
    }

    res.status(200).json({ success: true, mechanic: request.assignedMechanic });
  } catch (error) {
    console.error("Error fetching mechanic:", error);
    res.status(500).json({ success: false, message: "Error fetching mechanic" });
  }
});





// Get the total number of requests and mechanics for a garage
requestRoutes.get("/garages/:garageId/count", async (req, res) => {
  try {
    const { garageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(garageId)) {
      return res.status(400).json({ success: false, message: "Invalid garage ID" });
    }

    // Count the number of requests assigned to the garage
    const requestCount = await Request.countDocuments({ assignedGarage: garageId });

    // Count the number of mechanics for the garage
    const mechanicCount = await Mechanic.countDocuments({ garageId });

    res.json({
      success: true,
      totalRequests: requestCount,
      totalMechanics: mechanicCount,
    });
  } catch (error) {
    console.error("Error counting garage requests and mechanics:", error);
    res.status(500).json({ success: false, message: "Error counting requests and mechanics" });
  }
});




export default requestRoutes;