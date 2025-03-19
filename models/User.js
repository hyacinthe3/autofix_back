import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  location: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  carModel: { type: String, required: true },
  issueDescription: { type: String, required: true },
  requestStatus: { type: String, default: "pending" }, // pending, resolved
});

export default mongoose.model("User", UserSchema);
