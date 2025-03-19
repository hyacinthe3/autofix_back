import Garage from '../models/garageModel.js';

// Get all garages that are pending approval or rejected
export const getPendingGarages = async (req, res) => {
    try {
        const garages = await Garage.find({ approved: null }); // Null means the garage is pending approval
        res.status(200).json({ success: true, garages });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Approve a garage
export const approveGarage = async (req, res) => {
    try {
        const garage = await Garage.findById(req.params.id);

        if (!garage) {
            return res.status(404).json({ message: 'Garage not found' });
        }

        // Set the approval status to true
        garage.approved = true;
        await garage.save();

        res.status(200).json({ message: 'Garage approved successfully!', garage });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Reject a garage
export const rejectGarage = async (req, res) => {
    try {
        const garage = await Garage.findById(req.params.id);

        if (!garage) {
            return res.status(404).json({ message: 'Garage not found' });
        }

        // Set the approval status to false or delete the garage
        garage.approved = false;
        await garage.save();

        res.status(200).json({ message: 'Garage rejected successfully!', garage });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
