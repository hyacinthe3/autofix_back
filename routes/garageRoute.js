import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../cloudinaryconfig.js";
import multer from "multer";
import dotenv from "dotenv";
import Garage from "../models/garageModel.js";

dotenv.config();
const garageRoutes = express.Router();

// ✅ Configure Multer for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "garage_certifications",
    format: async () => "pdf",
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});
const upload = multer({ storage });

// ✅ Garage Registration Route
garageRoutes.post("/register", upload.single("certification"), async (req, res) => {
  try {
    console.log("Received request:", req.body);

    const { GarageName, GaragetinNumber, GaragePassword, location, Garagephone } = req.body;

    if (!GarageName || !GaragetinNumber || !GaragePassword || !location || !Garagephone) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // ✅ Parse location from JSON string
    let parsedLocation;
    try {
      parsedLocation = JSON.parse(location);
    } catch (error) {
      return res.status(400).json({ success: false, message: "Invalid location format" });
    }

    if (!parsedLocation.coordinates || !Array.isArray(parsedLocation.coordinates)) {
      return res.status(400).json({ success: false, message: "Location coordinates are required" });
    }

    const [longitude, latitude] = parsedLocation.coordinates;

    // ✅ Hash password before saving
    const hashedPassword = await bcrypt.hash(GaragePassword, 10);
    
    // ✅ Save certification URL from Cloudinary
    const certificationUrl = req.file ? req.file.path : null;

    const newGarage = new Garage({
      GarageName,
      GaragetinNumber,
      GaragePassword: hashedPassword,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
        address: parsedLocation.address
      },
      certification: certificationUrl,
      Garagephone,
      approvalStatus: "pending",
    });

    await newGarage.save();
    res.status(201).json({ success: true, message: "Garage registered successfully!" });

  } catch (error) {
    console.error("Error saving garage:", error);
    res.status(500).json({ success: false, message: "Error registering garage", error: error.message });
  }
});


// ✅ Garage Login (with approval check)
garageRoutes.post("/login", async (req, res) => {
  try {
    const { GaragetinNumber, GaragePassword } = req.body;

    const garage = await Garage.findOne({ GaragetinNumber });
    if (!garage) return res.status(404).json({ success: false, message: "Garage not found" });

    if (garage.approvalStatus !== "approved") {
      return res.status(403).json({ message: "Garage not approved. Please wait for admin approval." });
    }

    const isMatch = await bcrypt.compare(GaragePassword, garage.GaragePassword);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: garage._id }, process.env.JWT_SECRET || "defaultSecret", { expiresIn: "1d" });

    res.json({ success: true, token, garage });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// ✅ Get All Garages
garageRoutes.get("/all", async (req, res) => {
  try {
    const garages = await Garage.find();
    res.status(200).json(garages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Approve a Garage
garageRoutes.put("/approve/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const garage = await Garage.findById(id);

    if (!garage) return res.status(404).json({ message: "Garage not found" });

    garage.approvalStatus = "approved";
    await garage.save();

    res.status(200).json({ message: "Garage approved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Reject a Garage
garageRoutes.put("/reject/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const garage = await Garage.findById(id);

    if (!garage) return res.status(404).json({ message: "Garage not found" });

    garage.approvalStatus = "rejected";
    await garage.save();

    res.status(200).json({ message: "Garage rejected successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});





export default garageRoutes;
