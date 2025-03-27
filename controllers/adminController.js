import Garage from "../models/garageModel.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";  


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
      // Find user by email
      const user = await User.findOne({ userEmail });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Compare password
      const isMatch = await bcrypt.compare(userPassword, user.userPassword);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      // Check if the user is an admin
      if (user.userRole !== "admin") {
        return res.status(403).json({ message: "Access denied. You must be an admin." });
      }
  
      // Create JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.userRole },
        process.env.JWT_SECRET, // Ensure you have a secret in your .env file
        { expiresIn: "1h" }
      );
  
      // Send response with the token
      res.status(200).json({
        success: true,
        token,
        role: user.userRole,
      });
    } catch (error) {
      console.error("Error during admin login:", error); // Log detailed error message
      res.status(500).json({ message: "Server error", error: error.message }); // Send back the actual error message
    }
  };