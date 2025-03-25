import mongoose from "mongoose";

const mechanicSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  specialisation: { type: String, required: true },
  garageId: { type: mongoose.Schema.Types.ObjectId, ref: "Garage", required: true },
});

export default mongoose.model("Mechanic", mechanicSchema);
