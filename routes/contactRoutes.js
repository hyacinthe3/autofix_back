import express from 'express';
import { createContact, getAllContacts, deleteContact, getRecentMessages } from '../controllers/contactControllerl.js';  // Fixed import

const contactRouter = express.Router();

// Define routes
contactRouter.post("/createContact", createContact);
contactRouter.get('/contacts', getAllContacts); 
contactRouter.delete('/delete/:id', deleteContact);
contactRouter.get("/recent-messages", getRecentMessages);

export default contactRouter;
