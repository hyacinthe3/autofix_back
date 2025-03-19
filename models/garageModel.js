import mongoose from "mongoose";

const garageSchema = new mongoose.Schema({
  GarageName: { type: String, required: true },
  GaragetinNumber: { type: String, required: true, unique: true },
  GaragePassword: { type: String, required: true },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
    address: { type: String, required: true } // ✅ Added address field
  },
  certification: { type: String, required: true },
  Garagephone: { type: String, required: true },
  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  }
});

// ✅ Ensure geospatial indexing for queries
garageSchema.index({ location: "2dsphere" });

const Garage = mongoose.model("Garage", garageSchema);
export default Garage;
