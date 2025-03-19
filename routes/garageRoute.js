import express from "express";
import { registerGarage,GarageLogin } from "../controllers/garageController.js";
import { getAllGarages } from '../controllers/garageController.js'; // Adjust path as necessary
import upload from "../middleware/multer.js";
const GarageRouter = express();

GarageRouter.post("/GarageLogin",GarageLogin);
GarageRouter.post("/registerGarage",upload.single('certification'),registerGarage);
GarageRouter.get("/getAllGarages",getAllGarages);

export default GarageRouter;
