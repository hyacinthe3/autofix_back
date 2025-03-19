import transporter from '../utilis/mailer.js';
import Contact from '../models/contactModel.js';  // Adjust if the path is different

// Create a new contact and send an email
export const createContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const newContact = new Contact({ name, email, subject, message });

    await newContact.save();

    // Send email using Mailtrap
    const mailOptions = {
      from: '"Contact Form" <no-reply@yourwebsite.com>', // sender address
      to: 'hyacintheihimbazwe98@gmail.com', // Replace with your email
      subject: `New Contact Form Submission: ${subject}`, // Subject line
      text: `You have a new contact message from ${name}:

Name: ${name}
Email: ${email}
Subject: ${subject}
Message: ${message}`, // Plain text body
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to send email notification.',
          error: error.message,
        });
      }
      console.log('Message sent:', info.response);

      res.status(201).json({
        success: true,
        message: 'Contact created successfully and email sent!',
        contact: newContact,
      });
    });
  } catch (error) {
    console.error(error);
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
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};


export const deleteContact = async (req, res) => {
    try {
      const contactId = req.params.id;
      const contact = await Contact.findByIdAndDelete(contactId);
  
      if (!contact) {
        return res.status(404).json({ success: false, message: 'Contact not found' });
      }
  
      res.status(200).json({ success: true, message: 'Contact deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  };