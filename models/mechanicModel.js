// models/MechanicModel.js
import mongoose from 'mongoose';

const mechanicSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    specialisation: { type: String, required: true },
  },
  { timestamps: true }
);

const Mechanic = mongoose.model('Mechanic', mechanicSchema);

export default Mechanic;
