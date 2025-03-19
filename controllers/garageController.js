import Garage from '../models/garageModel.js';
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // Fixed Typo
});

export const registerGarage= async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Certificate required" });
        }

        const cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
            folder: "certificates"
        });

        console.log("Cloudinary Response:", cloudinaryResult);

        const { GarageNames, GaragePassword, GaragetinNumber, location, specialisation } = req.body;

        // Check if user already exists
        const existingGarage = await Garage.findOne({ GaragetinNumber });
        if (existingGarage) {
            return res.status(400).json({ message: 'Garage already registered with this tin number' });
        }

        // Encrypt password
        const hashedPassword = await bcrypt.hash(GaragePassword, 10);

        // Save garage to database
        const garage = new Garage({
            GarageNames,
            GaragePassword: hashedPassword,
            GaragetinNumber,  // Add this line
            location,
            specialisation,
            certification: cloudinaryResult.secure_url, // Save file path
        });
        

        await garage.save();

        res.status(201).json({
            message: 'Garage registered successfully!',
            garage: {
                _id: garage._id,
                GarageNames: garage.GarageNames,
                GaragetinNumber: garage.GaragetinNumber,
                location: garage.location,
                specialisation: garage.specialisation,
            },
        });

    } catch (error) {
        console.error('Error in garage registration:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const GarageLogin = async (req, res) => {
    try {
        const { GaragetinNumber, GaragePassword } = req.body;
        const garage = await Garage.findOne({ GaragetinNumber});

        if (!garage) {
            return res.status(404).json({ message: "garage not found" });
        }

        const isMatch = await bcrypt.compare(GaragePassword, garage.GaragePassword);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const garageResponse = {
            _id: garage._id,
            GarageNames: garage.GarageNames,
            GaragetinNumber: garage.GaragetinNumber,
        };

        res.json({ garage: garageResponse });

    } catch (error) {
        console.error('Error in garage registration:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
    
};



export const getAllGarages = async (req, res) => {
  try {
    // Fetch all garage from the database
    const garage = await Garage.find(); 
    res.status(200).json({ success: true, garage });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};



export const getGarageById = async (req, res) => {
    try {
        const garage = await Garage.findById(req.params.id);

        if (!garage) {
            return res.status(404).json({ message: 'Garage not found' });
        }

        res.status(200).json({ success: true, garage });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};



export const updateGarageById = async (req, res) => {
    try {
        const { GarageNames, GaragePassword, GaragetinNumber, location, specialisation } = req.body;

        const garage = await Garage.findById(req.params.id);

        if (!garage) {
            return res.status(404).json({ message: 'Garage not found' });
        }

        // Optionally handle password change
        if (GaragePassword) {
            const hashedPassword = await bcrypt.hash(GaragePassword, 10);
            garage.GaragePassword = hashedPassword;
        }

        // Update garage fields
        garage.GarageNames = GarageNames || garage.GarageNames;
        garage.GaragetinNumber = GaragetinNumber || garage.GaragetinNumber;
        garage.location = location || garage.location;
        garage.specialisation = specialisation || garage.specialisation;

        await garage.save();

        res.status(200).json({
            message: 'Garage updated successfully!',
            garage,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};




export const deleteGarageById = async (req, res) => {
    try {
        const garage = await Garage.findByIdAndDelete(req.params.id);

        if (!garage) {
            return res.status(404).json({ message: 'Garage not found' });
        }

        res.status(200).json({ message: 'Garage deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
