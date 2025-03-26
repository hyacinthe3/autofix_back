import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema({
  carIssue: { type: String, required: true },
  carModel: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ["Point"], // The geometry type is "Point"
      default: "Point",
    },
    coordinates: { 
      type: [Number], // [longitude, latitude]
      required: true,
    },
    address: { type: String, required: true }, // Address is also stored
  },
  contact: { type: String, required: true },
  status: { type: String, default: "pending" }, // Default status is "pending"
  assignedGarage: { type: mongoose.Schema.Types.ObjectId, ref: "Garage" }, // Reference to Garage
  assignedMechanic: [{ type: mongoose.Schema.Types.ObjectId, ref: "Mechanic" }], // Array of mechanics
  assignedAt: { type: Date, default: null },  //store assignement time
}, { timestamps: true });

// Create a geospatial index on the location field for efficient queries
RequestSchema.index({ location: "2dsphere" });
RequestSchema.index({ assignedAt: 1 }, { expireAfterSeconds: 86400 });

const Request = mongoose.model("Request", RequestSchema);
export default Request;
