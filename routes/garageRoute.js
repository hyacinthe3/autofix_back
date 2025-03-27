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
  cloudinary,
  params: {
    folder: "garage_certifications",
    format: async () => "pdf",
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});
const upload = multer({ storage });

// ✅ Middleware for Authentication
const authenticateGarage = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretKey");
    req.garageId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

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

    // ✅ Check if the TIN Number or Phone already exists in the database
    const existingGarage = await Garage.findOne({
      $or: [
        { GaragetinNumber },  // Check by TIN Number
        { Garagephone }       // Check by Phone Number
      ]
    });

    if (existingGarage) {
      if (existingGarage.GaragetinNumber === GaragetinNumber) {
        return res.status(400).json({ success: false, message: "Garage TIN Number already exists" });
      }
      if (existingGarage.Garagephone === Garagephone) {
        return res.status(400).json({ success: false, message: "Garage Phone Number already exists" });
      }
    }

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

    // ✅ Generate token
    const token = jwt.sign(
      { 
        id: newGarage._id, 
        GarageName, 
        GaragetinNumber, 
        location: newGarage.location, 
        certification: certificationUrl, 
        Garagephone
      },
      process.env.JWT_SECRET || "secretKey",
      { expiresIn: "1d" }
    );

    res.status(201).json({ success: true, message: "Garage registered successfully!", token });

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

    if (!garage) return res.status(404).json({ success: false, message: "Garage not found or it is not approved by admin yet" });

    const isMatch = await bcrypt.compare(GaragePassword, garage.GaragePassword);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    if (garage.approvalStatus !== "approved") {
      return res.status(403).json({ success: false, message: "Garage not approved yet." });
    }

    const token = jwt.sign(
      { id: garage._id, GaragetinNumber: garage.GaragetinNumber },
      process.env.JWT_SECRET || "secretKey",
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      garage: {
        id: garage._id,
        GarageName: garage.GarageName,
        GaragetinNumber: garage.GaragetinNumber,
        location: garage.location,
        certification: garage.certification,
        Garagephone: garage.Garagephone,
      }
    });
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
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// ✅ Get Garage By ID
garageRoutes.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const garage = await Garage.findById(id);
    if (!garage) return res.status(404).json({ success: false, message: "Garage not found" });
    res.status(200).json(garage);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching garage data", error: error.message });
  }
});

// ✅ Approve a Garage
garageRoutes.put("/approve/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const garage = await Garage.findById(id);

    if (!garage) return res.status(404).json({ success: false, message: "Garage not found" });

    garage.approvalStatus = "approved";
    await garage.save();

    res.status(200).json({ success: true, message: "Garage approved successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// ✅ Reject a Garage
garageRoutes.put("/reject/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const garage = await Garage.findById(id);

    if (!garage) return res.status(404).json({ success: false, message: "Garage not found" });

    garage.approvalStatus = "rejected";
    await garage.save();

    res.status(200).json({ success: true, message: "Garage rejected successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// ✅ Protected Garage Profile Route
garageRoutes.get("/profile", authenticateGarage, async (req, res) => {
  try {
    const garage = await Garage.findById(req.garageId);
    if (!garage) return res.status(404).json({ success: false, message: "Garage not found" });
    res.status(200).json(garage);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});




// Route to get the count of total, approved, and pending garages
garageRoutes.get('/garages/all', async (req, res) => {
  try {
    console.log("Fetching garage counts..."); // ✅ Debugging

    const totalGarages = await Garage.countDocuments();
    const approvedGarages = await Garage.countDocuments({ approvalStatus: 'approved' });
    const pendingGarages = await Garage.countDocuments({ approvalStatus: 'pending' });

    console.log({ totalGarages, approvedGarages, pendingGarages }); // ✅ Debugging

    return res.status(200).json({ totalGarages, approvedGarages, pendingGarages });
  } catch (error) {
    console.error('Error fetching garage counts:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default garageRoutes;
