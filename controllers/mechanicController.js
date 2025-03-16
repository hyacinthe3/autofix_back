import Mechanic from '../models/mechanicModel.js';
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // Fixed Typo
});

export const registerMechanic = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Certificate required" });
        }

        const cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
            folder: "certificates"
        });

        console.log("Cloudinary Response:", cloudinaryResult);

        const { MechanicNames, MechanicEmail, MechanicPassword, MechanicphoneNumber, location, specialisation } = req.body;

        // Check if user already exists
        const existingMechanic = await Mechanic.findOne({ MechanicEmail });
        if (existingMechanic) {
            return res.status(400).json({ message: 'Mechanic already registered with this email' });
        }

        // Encrypt password
        const hashedPassword = await bcrypt.hash(MechanicPassword, 10);

        // Save mechanic to database
        const mechanic = new Mechanic({
            MechanicNames,
            MechanicEmail,
            MechanicPassword: hashedPassword,
            MechanicphoneNumber,
            location,
            specialisation,
            certification: cloudinaryResult.secure_url, // Save file path
        });

        await mechanic.save();

        res.status(201).json({
            message: 'Mechanic registered successfully!',
            mechanic: {
                _id: mechanic._id,
                MechanicNames: mechanic.MechanicNames,
                MechanicEmail: mechanic.MechanicEmail,
                MechanicphoneNumber: mechanic.MechanicphoneNumber,
                location: mechanic.location,
                specialisation: mechanic.specialisation,
            },
        });

    } catch (error) {
        console.error('Error in mechanic registration:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const MechanicLogin = async (req, res) => {
    try {
        const { MechanicEmail, MechanicPassword } = req.body;
        const mechanic = await Mechanic.findOne({ MechanicEmail });

        if (!mechanic) {
            return res.status(404).json({ message: "Mechanic not found" });
        }

        const isMatch = await bcrypt.compare(MechanicPassword, mechanic.MechanicPassword);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const mechanicResponse = {
            _id: mechanic._id,
            MechanicNames: mechanic.MechanicNames,
            MechanicEmail: mechanic.MechanicEmail,
        };

        res.json({ mechanic: mechanicResponse });

    } catch (error) {
        console.error('Error in mechanic registration:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
    
};



export const getAllMechanics = async (req, res) => {
    try {
      // Fetch all mechanics from the database
      const mechanics = await Mechanic.find(); 
      res.status(200).json({ success: true, mechanics });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  };