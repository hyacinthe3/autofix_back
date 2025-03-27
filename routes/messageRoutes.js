import express from "express";
import { sendMessage, getMessages } from "../controllers/messageController.js";

const messageRoutes = express.Router();

// Route to send a message
messageRoutes.post("/send", sendMessage);

// Route to fetch messages between two users
messageRoutes.get("/:senderId/:receiverId", getMessages);

export default messageRoutes;
