import Mechanic from '../models/mechanicModel.js'; // ✅ Check this path!

const registerMechanic = async (req, res) => {
  try {
    console.log("Received request body:", req.body); // Log request body

    const { fullName, phoneNumber, specialisation } = req.body;

    // Check if the mechanic already exists
    const existingMechanic = await Mechanic.findOne({ phoneNumber });
    if (existingMechanic) {
      return res.status(400).json({ message: "Mechanic with this phone number already exists" });
    }

    // Create a new mechanic instance
    const newMechanic = new Mechanic({
      fullName,
      phoneNumber,
      specialisation,
    });

    // Save the mechanic to the database
    await newMechanic.save();

    res.status(201).json({
      message: "Mechanic Registered Successfully!",
      mechanic: newMechanic,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Something went wrong during the registration process.",
      error: error.message,
    });
  }
};





// Get all mechanics
const getAllMechanics = async (req, res) => {
  try {
    const mechanics = await Mechanic.find();
    res.status(200).json(mechanics);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to fetch mechanics.',
      error: error.message,
    });
  }
};





// Get mechanic by ID
const getMechanicById = async (req, res) => {
  try {
    const mechanic = await Mechanic.findById(req.params.id);

    if (!mechanic) {
      return res.status(404).json({ message: 'Mechanic not found' });
    }

    res.status(200).json(mechanic);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to fetch mechanic.',
      error: error.message,
    });
  }
};





// Delete mechanic by ID
const deleteMechanicById = async (req, res) => {
  try {
    const mechanic = await Mechanic.findByIdAndDelete(req.params.id);

    if (!mechanic) {
      return res.status(404).json({ message: 'Mechanic not found' });
    }

    res.status(200).json({ message: 'Mechanic deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to delete mechanic.',
      error: error.message,
    });
  }
};






// Update mechanic by ID
const updateMechanicById = async (req, res) => {
  try {
    const { fullName, phoneNumber, specialization } = req.body;

    const mechanic = await Mechanic.findByIdAndUpdate(
      req.params.id,
      { fullName, phoneNumber, specialization },
      { new: true }
    );

    if (!mechanic) {
      return res.status(404).json({ message: 'Mechanic not found' });
    }

    res.status(200).json({ message: 'Mechanic updated successfully', mechanic });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to update mechanic.',
      error: error.message,
    });
  }
};

export {
  registerMechanic,
  getAllMechanics,
  getMechanicById,
  deleteMechanicById,
  updateMechanicById,
};
