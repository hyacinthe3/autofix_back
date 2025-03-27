import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Garage" },
    receiverId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Garage" },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
