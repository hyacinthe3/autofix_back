import Contact from '../models/contactModel.js';  // Adjust if needed

// Create a new contact
export const createContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const newContact = new Contact({ name, email, subject, message });

    await newContact.save();

    res.status(201).json({
      success: true,
      message: 'Contact created successfully!',
      contact: newContact,
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// Get all contacts
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 }); // Get all contacts sorted by most recent
    res.status(200).json({
      success: true,
      count: contacts.length,
      contacts,
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// Delete a contact
export const deleteContact = async (req, res) => {
  try {
    const contactId = req.params.id;
    const contact = await Contact.findByIdAndDelete(contactId);

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    res.status(200).json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get recent messages (last 24 hours)
export const getRecentMessages = async (req, res) => {
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentMessages = await Contact.find({
      createdAt: { $gte: oneDayAgo } // Messages from last 24 hours
    }).select("name subject createdAt");

    res.json({ contacts: recentMessages });
  } catch (error) {
    console.error('Error fetching recent messages:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
