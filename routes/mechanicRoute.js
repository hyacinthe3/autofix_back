import express from "express";
import { registerMechanic,MechanicLogin } from "../controllers/mechanicController.js";
import { getAllMechanics } from '../controllers/mechanicController.js'; // Adjust path as necessary
import upload from "../middleware/multer.js";
const MechanicRouter = express();

MechanicRouter.post("/mechaniclogin",MechanicLogin);
MechanicRouter.post("/registerMechanic",upload.single('certification'),registerMechanic);
MechanicRouter.get("/getAllMechanics",getAllMechanics);

export default MechanicRouter;
