import Message from "../models/Message.js";

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;

    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const newMessage = new Message({ senderId, receiverId, message });
    await newMessage.save();

    res.status(201).json({ success: true, message: "Message sent successfully", data: newMessage });
  } catch (error) {
    console.error("Error sending message:", error.message);
    res.status(500).json({ success: false, message: "Error sending message" });
  }
};

// Get messages between two users
export const getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ timestamp: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    res.status(500).json({ success: false, message: "Error fetching messages" });
  }
};
