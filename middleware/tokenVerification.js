import jwt from "jsonwebtoken"
import User from "../models/userModel.js"
import dotenv from "dotenv"
dotenv.config()
console.log("JWT_SECRET:", process.env.JWT_SECRET);

export const auth=async(req,res,next) =>{
    const authHeader = req.headers.authorization;

    if (!authHeader){
        return res.status(401).json({message:"Authorization header is missing"});
    }

    const token =authHeader.split(" ")[1];
    if(!token){
        return res.status(401).json({message:"token missing"})
    }
    try{
        const decoded =jwt.verify(token,process.env.JWT_SECRET);
        const garage = await Garage.findOne({
            _id:decoded._id,
            "tokens.accessToken":token,
        });

        if (!garage){
            return res
            .status(401)
            .json({message:"User not found or token invalid"})
        }

        req.token = token;
        req.user = garage;
        next();
    }
    catch(error){
        console.error("JWT Verification Error:", error);
        res.status(401).json({message:"Authentication failed",error:error.message});
    }

};