import SupportMessage from "../models/SupportMessage.js";
import nodemailer from "nodemailer";

export const sendSupportMessage = async (req, res) => {
  try {
    const { fullName, email, message } = req.body;

    if (!fullName || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newMessage = new SupportMessage({ fullName, email, message });
    await newMessage.save();

    // Ensure .env variables are loaded
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.ADMIN_EMAIL) {
      console.error("❌ Missing email environment variables.");
      return res.status(500).json({ error: "Email configuration error." });
    }

    // Send email notification
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: "New Support Message",
      text: `You received a new support message from ${fullName} (${email}):\n\n${message}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: "Support message sent successfully" });
  } catch (error) {
    console.error("❌ Error sending support message:", error);
    res.status(500).json({ error: "Server error. Please try again." });
  }
};
