import { createContact,getAllContact,getContactById,deleteContactById,updateContactById } from "../controllers/contactControllers.js";
import express from "express";
import { admin } from "../middlewares/roleIdentification.js";
import { auth } from "../middlewares/tokenVerification.js";

const contactRouter=express.Router();

contactRouter.post("/createContact",createContact);
contactRouter.get("/getAllContact",auth,admin,getAllContact);
contactRouter.get("/getContactById/:id",auth,admin,getContactById);
contactRouter.delete("/deleteContactById/:id",auth,admin,deleteContactById);
contactRouter.put("/updateContactById/:id",auth,admin,updateContactById);

export default contactRouter;