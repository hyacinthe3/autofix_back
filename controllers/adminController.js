// Backend - controllers/adminController.js
import Garage from '../models/garageModel.js';

// Get all garages
export const getAllGarage = async (req, res) => {
    try {
        const garage = await Garage.find();
        res.json(garage);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};




export const updateGarageStatus = async (req, res) => {
    const { status } = req.body;
    try {
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }
        const garage = await Garage.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!garage) return res.status(404).json({ message: 'Garage not found' });
        res.json({ message: `Garage ${status}`, garage });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
