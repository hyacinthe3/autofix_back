import Request from '../models/Request.js';

export const createRequest = async (req, res) => {
  const { carIssue, carModel, location, contact } = req.body;

  try {
    const newRequest = new Request({ carIssue, carModel, location, contact });
    await newRequest.save();
    res.json({ success: true, message: 'Request saved successfully!' });
  } catch (error) {
    console.error('Error saving request:', error);
    res.status(500).json({ success: false, message: 'Failed to save request.' });
  }
};

export const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find();
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch requests.' });
  }
};


