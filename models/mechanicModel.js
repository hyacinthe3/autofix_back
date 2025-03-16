import mongoose from 'mongoose';

const mechanicSchema = new mongoose.Schema({
  MechanicNames: {
    type: String,
    required: true,
  },
  MechanicEmail: {
    type: String,
    required: true,
    unique: true
  },
  MechanicPassword: {
    type: String,
    required: true
  },
  MechanicphoneNumber: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  specialisation: {
    type: String,
    required: true
  },
  certification: {
    type: String,
    required: true
  },
});

const Mechanic = mongoose.model('Mechanic', mechanicSchema);
export default Mechanic;
