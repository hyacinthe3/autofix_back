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
    return response.data.display_name || "Unknown Location"; // Human-readable address
  } catch (error) {
    console.error("Error fetching address:", error);
    return "Unknown Location";
  }
};

// 📌 Create a new request
// 📌 Create a new request
requestRoutes.post("/send", async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const { carIssue, carModel, location, contact } = req.body;

    if (!location || !location.coordinates || location.coordinates.length !== 2) {
      return res.status(400).json({ success: false, message: "Valid location coordinates are required (longitude, latitude)" });
    }

    // Convert coordinates to an address
    const address = await getAddressFromCoordinates(location.coordinates[1], location.coordinates[0]);

    // Create and save new request
    const newRequest = new Request({
      carIssue,
      carModel,
      location: { coordinates: location.coordinates, address }, // Store address in the database
      contact,
    });

    await newRequest.save();

    // Find nearest garages with 'approved' status
    const garages = await Garage.find({ approvalStatus: 'approved' }); // Filter by approved garages
    const garagesWithDistance = garages
      .map((garage) => {
        if (!garage.location || !garage.location.coordinates || garage.location.coordinates.length !== 2) {
          return null; // Skip invalid locations
        }

        const distance = haversine(location.coordinates, garage.location.coordinates) / 1000; // Convert meters to km

        return { ...garage.toObject(), distance };
      })
      .filter((garage) => garage !== null);

    // Sort garages by distance
    garagesWithDistance.sort((a, b) => a.distance - b.distance);

    res.status(201).json({
      success: true,
      message: "Request sent successfully!",
      nearestGarages: garagesWithDistance,
    });
  } catch (error) {
    console.error("Error sending request:", error);
    res.status(500).json({ success: false, message: "Error sending request", error: error.message });
  }
});


// 📌 Assign request to selected garage
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

    // Convert coordinates to an address
    const address = await getAddressFromCoordinates(location.coordinates[1], location.coordinates[0]);

    // Save request with assigned garage
    const assignedRequest = new Request({
      carIssue,
      carModel,
      location: { coordinates: location.coordinates, address }, // Store address
      contact,
      assignedGarage: garageId,
    });

    await assignedRequest.save();

    res.status(201).json({ success: true, message: "Request assigned successfully!" });
  } catch (error) {
    console.error("Error assigning request:", error);
    res.status(500).json({ success: false, message: "Error assigning request", error: error.message });
  }
});

// 📌 Get all requests for a specific garage
requestRoutes.get("/garages/:garageId/requests", async (req, res) => {
  try {
    const { garageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(garageId)) {
      return res.status(400).json({ success: false, message: "Invalid garage ID" });
    }

    // Find requests assigned to this garage
    const requests = await Request.find({ assignedGarage: garageId }).populate("assignedGarage").exec();

    if (requests.length === 0) {
      return res.status(404).json({ success: false, message: "No requests found for this garage" });
    }

    res.json({ success: true, requests });
  } catch (error) {
    console.error("Error fetching garage requests:", error);
    res.status(500).json({ success: false, message: "Error fetching requests", error: error.message });
  }
});



// 📌 Get all mechanics for a specific garage
requestRoutes.get("/garages/:garageId/mechanics", async (req, res) => {
  try {
    const { garageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(garageId)) {
      return res.status(400).json({ success: false, message: "Invalid garage ID" });
    }

    // Find mechanics associated with this garage
    const mechanics = await Mechanic.find({ garageId });

    if (!mechanics.length) {
      return res.status(404).json({ success: false, message: "No mechanics found for this garage" });
    }

    res.json({ success: true, mechanics });
  } catch (error) {
    console.error("Error fetching mechanics:", error);
    res.status(500).json({ success: false, message: "Error fetching mechanics", error: error.message });
  }
});





requestRoutes.post("/assign-mechanic", async (req, res) => {
  const { requestId, mechanicId } = req.body;

  try {
      const request = await Request.findById(requestId);
      if (!request) {
          return res.status(404).json({ success: false, message: "Request not found" });
      }

      const mechanic = await Mechanic.findById(mechanicId);
      if (!mechanic) {
          return res.status(404).json({ success: false, message: "Mechanic not found" });
      }

      // Assign mechanic and update status
      request.assignedMechanic = mechanicId;
      request.status = "Assigned";
      await request.save();

      res.status(200).json({ success: true, message: "Mechanic assigned successfully" });
  } catch (error) {
      console.error("Error assigning mechanic:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
  }
});




// 📌 Get the total number of requests assigned to a garage
requestRoutes.get("/garages/:garageId/requests/count", async (req, res) => {
  try {
    const { garageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(garageId)) {
      return res.status(400).json({ success: false, message: "Invalid garage ID" });
    }

    // Count requests assigned to the garage
    const requestCount = await Request.countDocuments({ assignedGarage: garageId });

    res.json({ success: true, totalRequests: requestCount });
  } catch (error) {
    console.error("Error counting garage requests:", error);
    res.status(500).json({ success: false, message: "Error counting requests", error: error.message });
  }
});


export default requestRoutes;
