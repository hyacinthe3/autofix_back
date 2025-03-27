import Garage from "../models/garageModel.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// Get all garages (Admins only)
export const getAllGarage = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const garages = await Garage.find();
        res.json(garages);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Approve or Reject a Garage (Admins only)
export const updateGarageStatus = async (req, res) => {
    const { status } = req.body;

    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value. Use 'approved' or 'rejected'." });
        }

        const garage = await Garage.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!garage) {
            return res.status(404).json({ message: "Garage not found" });
        }

        res.json({ message: `Garage ${status} successfully`, garage });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Admin Login Function
export const adminLogin = async (req, res) => {
    const { userEmail, userPassword } = req.body;

    try {
        // Check if the user exists using userEmail
        const user = await User.findOne({ userEmail });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the user's role is admin
        if (user.role !== 'admin') {
            return res.status(403).json({ message: "Unauthorized: Admins only" });
        }

        // Check if the password matches (using userPassword from the request and the hashed password in the database)
        const isMatch = await bcrypt.compare(userPassword, user.userPassword);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Create a JWT token (example: expires in 1 hour)
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Send token and role in response
        return res.json({
            success: true,
            token,
            role: user.role,
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};