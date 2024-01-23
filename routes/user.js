const express = require('express');
const User = require('../models/User');
const OTP = require('../models/OTP');
const nodemailer = require('nodemailer');
const authMiddleware= require("../middlewares/AdminAuthorization_middleware")


const router = express.Router();

// Define the HTML email content
const htmlEmailContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            font-family: Arial, sans-serif;
            color: #333333;
        }
        .header {
            background-color:#4A90E2;
            color: white;
            padding: 10px;
            text-align: center;
        }
        .body-content {
            padding: 20px;
            text-align: center;
        }
        .footer {
            background-color: #f2f2f2;
            padding: 10px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>CoCreateLabs</h1>
        </div>
        <div class="body-content">
            <p>Hello from CoCreateLabs,</p>
            <p>Your One-Time Password (OTP) for Event registration is:</p>
            <h2>{{OTP}}</h2>
            <p>This OTP is valid for 30 minutes.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 CoCreateLabs. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

// Generate OTP and send to user's email
router.post('/generate-otp', async (req, res) => {
    const { email } = req.body;
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 30 * 60000); // OTP expires in 30 minutes

    try {
        // Delete any existing OTPs for this email
        await OTP.deleteMany({ email });

        // Create a new OTP
        const newOtp = new OTP({
            email,
            otp: otpCode,
            expiresAt: otpExpires
        });

        await newOtp.save();

        // NodeMailer logic to send the OTP via email
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        let info = await transporter.sendMail({
            from: '"CoCreateLabs"',
            to: email,
            subject: "Your OTP for CoCreateLabs",
            html: htmlEmailContent.replace('{{OTP}}', otpCode), // Send the HTML content
        });

        console.log("Message sent: %s", info.messageId);
        res.status(200).send({ message: 'OTP sent to email' });
    } catch (error) {
        res.status(500).send({ message: 'Error generating OTP', error });
    }
});




// Verify OTP
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const otpEntry = await OTP.findOne({ email, otp, expiresAt: { $gte: new Date() } });

        if (!otpEntry || otpEntry.used) {
            return res.status(400).send({ message: 'Invalid or expired OTP' });
        }

        // Mark OTP as used
        otpEntry.used = true;
        await otpEntry.save();

        

        res.status(200).send({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error verifying OTP', error });
    }
});





// Traditional user signup
router.post('/signup', async (req, res) => {
    const { 
        name, 
        email, 
        companyName,
        designation,
        mobile,
        website,
        linkedin,
        address,
        aboutCompany,
        remarks
    } = req.body;

    try {
        // Check if the user already exists and has verified their email
        const existingUser = await User.findOne({ email });
        console.log(existingUser);

        // If a user exists and has verified their email, return an error
        if (existingUser) {
            return res.status(400).send({ message: 'User already exists' });
        }

        // Check if there's an OTP entry for the email and if it has been used
        const otpEntry = await OTP.findOne({ email, used: false });

        // If an OTP entry exists and has not been used, it means email is not verified
        if (otpEntry) {
            return res.status(400).send({ message: 'Email not verified' });
        }

        // Create a new user
        const user = new User({
            name, 
            email, 
            companyName,
            designation,
            mobile,
            website,
            linkedin,
            address,
            aboutCompany,
            remarks
        });

        await user.save();

        res.status(201).send({ message: 'User created successfully' });
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).send({ message: 'Error creating user', error: error.message });
    }
});



// Example of a protected route
router.get('/eventdata',authMiddleware,async (req, res) => {
    try {
        const users = await User.find({}); // Fetch all users
        res.status(200).send({"eventdata":users});
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



// DELETE route to delete an event
router.delete('/eventdata/:eventId',authMiddleware, async (req, res) => {
    const eventId = req.params.eventId;

    try {
        const event = await User.find({ _id: eventId });
        if (!event) {
            return res.status(404).send('Event data not found');
        }

        await User.deleteOne({ _id: eventId });
        res.send('deleted successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



// DELETE route to delete an event
router.delete('/event/bulk',authMiddleware, async (req, res) => {
    try {
        const { ids } = req.body;
    
        if (!ids || ids.length === 0) {
          return res.status(400).send({ message: 'No IDs provided' });
        }
    
        // Delete events with IDs in the provided array
        await User.deleteMany({ _id: { $in: ids } });
    
        res.status(200).send({ message: 'Events deleted successfully' });
      } catch (err) {
        console.error('Error during bulk deletion:', err);
        res.status(500).send({ message: 'Error during bulk deletion' });
      }
});





module.exports = router;
