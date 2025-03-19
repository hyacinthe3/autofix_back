import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema(
  {
    carIssue: { type: String, required: true },
    carModel: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    contact: { type: String, required: true },
  },
  { timestamps: true }
);

const Request = mongoose.model('Request', requestSchema);

export default Request;
