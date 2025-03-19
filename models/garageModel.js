import mongoose from 'mongoose';

const garageSchema = new mongoose.Schema({
    GarageNames: { type: String, required: true },
    GaragePassword: { type: String, required: true },
    GaragetinNumber: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    specialisation: { type: String, required: true },
    certification: { type: String, required: true },
    approvalStatus: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    }
}, { timestamps: true });

export default mongoose.model('Garage', garageSchema);
