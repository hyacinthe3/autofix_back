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



export default requestRoutes;