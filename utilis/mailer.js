import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'Mailtrap',
  auth: {
    user: process.env.MAILTRAP_USER, // Your Mailtrap user
    pass: process.env.MAILTRAP_PASS, // Your Mailtrap password
  },
});

export default transporter;


export const sendEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: 'hyacintheihimbazwe98@gmail.com',  // Your "From" email address
    to,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.log('Error sending email: ', error);
  }
};

