import jwt from "jsonwebtoken";
import dotenv from "dotenv";
  
dotenv.config();

export const generateAccessToken = (garage) =>{
    return jwt.sign(
        {_id:garage._id, role: 'garage', status: garage.approvalStatus},
        process.env.JWT_SECRET,
        { expiresIn: "7d" }

    );
};
