import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const sendEmail = async (options) => {
    // Create transporter using Gmail SMTP & App Password
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', // Gmail SMTP Host
        port: 465,              // Gmail SSL Port
        secure: true,           // Use SSL
        auth: {
            user: process.env.EMAIL_USER, // Gmail address from .env
            pass: process.env.EMAIL_PASS, // Gmail App Password from .env
        },
    });

    // Define email options
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.email,            // Recipient email address
        subject: options.subject,     // Email subject line
        text: options.message,        // Plain text body
    };

    // Send the email
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully: %s', info.messageId);
        // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info)); // Only works with ethereal test accounts
        return true;
    } catch (error) {
        console.error('Error sending email via Gmail:', error);
        return false;
    }
};

export default sendEmail;