import Garage from '../models/garageModel.js';
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from "cloudinary";
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import '../models/garageModel.js'

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // Fixed Typo
});





export const registerGarage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Certificate required" });
        }

        const cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
            folder: "certificates"
        });

        const { GarageNames, GaragePassword, GaragetinNumber, location } = req.body;

        // Check if garage already exists
        const existingGarage = await Garage.findOne({ GaragetinNumber });
        if (existingGarage) {
            return res.status(400).json({ message: 'Garage already registered with this tin number' });
        }

        // Encrypt password
        const hashedPassword = await bcrypt.hash(GaragePassword, 10);

        // Create the garage object
        const garage = new Garage({
            GarageNames,
            GaragePassword: hashedPassword,
            GaragetinNumber,
            location,
            certification: cloudinaryResult.secure_url,
        });

        // Generate JWT token
        const token = jwt.sign(
            { garageId: garage._id, GaragetinNumber: garage.GaragetinNumber },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Assign the token to the garage object
        garage.token = token;

        // Save garage to database with token
        await garage.save();

        res.status(201).json({
            message: 'Garage registered successfully! Wait for Admin approval.',
            garage: {
                _id: garage._id,
                GarageNames: garage.GarageNames,
                GaragetinNumber: garage.GaragetinNumber,
                location: garage.location,
                specialisation: garage.specialisation,
                token: garage.token // Now this will be saved in MongoDB
            },
        });

    } catch (error) {
        console.error('Error in garage registration:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const GarageLogin = async (req, res) => {
    const { GaragetinNumber, GaragePassword } = req.body;

    try {
        // Find garage by TIN number
        const garage = await Garage.findOne({ GaragetinNumber });
        if (!garage) {
            return res.status(404).json({ message: "Garage not found" });
        }

        // ✅ Fix: Check the correct field name
        if (garage.approvalStatus !== 'approved') {
            return res.status(403).json({ message: "Garage not approved. Please wait for admin approval." });
        }

        // Compare password
        const isMatch = await bcrypt.compare(GaragePassword, garage.GaragePassword);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials. Please check your TIN and password." });
        }

        // Generate JWT token
        const token = jwt.sign({ id: garage._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: "Login successful", token, garage });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



export const getAllGarages = async (req, res) => {
    try {
        const garages = await Garage.find();
        res.status(200).json(garages);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Approve a garage
export const approveGarage = async (req, res) => {
    try {
        const { id } = req.params;
        const garage = await Garage.findById(id);
        
        if (!garage) {
            return res.status(404).json({ message: "Garage not found" });
        }

        garage.approvalStatus = "approved";
        await garage.save();

        res.status(200).json({ message: "Garage approved successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



// Reject a garage
export const rejectGarage = async (req, res) => {
    try {
        const { id } = req.params;
        const garage = await Garage.findById(id);
        
        if (!garage) {
            return res.status(404).json({ message: "Garage not found" });
        }

        garage.approvalStatus = "rejected";
        await garage.save();

        res.status(200).json({ message: "Garage rejected successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
