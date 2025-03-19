import express from 'express';
import {createContact,getAllContacts,deleteContact} from '../controllers/contactControllerl.js';  // Correct import

const contactRouter = express();

// Define your routes here
contactRouter.post("/createContact", createContact);
contactRouter.get('/contacts', getAllContacts); 
contactRouter.delete('/delete/:id', deleteContact);


contactRouter.get("/recent-messages", async (req, res) => {
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentMessages = await Contact.find({
      createdAt: { $gte: oneDayAgo } // Messages from last 24 hours
    }).select("name subject createdAt");

    res.json({ contacts: recentMessages });
  } catch (error) {
    console.error("Error fetching recent messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
export default contactRouter;
