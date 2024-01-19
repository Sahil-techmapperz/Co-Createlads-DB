const express = require('express');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const AWS = require('aws-sdk');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');

const router = express.Router();


AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

router.get("/",(req,res)=>{
    res.status(200).send("Hello from admin");
});



router.post('/profile/profileimage_update', upload.single('image'), (req, res) => {
    const file = req.file;
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: file.originalname,
        Body: fs.createReadStream(file.path),
        ContentType: file.mimetype,
    };

    s3.upload(params, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error uploading to S3');
            return;
        }

        let url=data.Location;

        res.status(200).send({"url":url});
    });
});


// Admin login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ email: email.toLowerCase() });
        if (!admin) {
            return res.status(401).send('Authentication failed');
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).send('Authentication failed');
        }

        // Create session
        req.session.adminId = admin._id;
        res.status(200).send({"user":admin,"message":"Login Success"});
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



// Admin signup route
router.post('/signup', async (req, res) => {
    const { email, password, fullName, username, role } = req.body;

    try {
        // Check if the admin already exists
        let admin = await Admin.findOne({ email: email.toLowerCase() });
        if (admin) {
            return res.status(400).send('Admin already exists');
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new admin with required fields
        admin = new Admin({
            email: email.toLowerCase(),
            password: hashedPassword,
            fullName: fullName,
            username: username,
            role: role
        });

        await admin.save();
        res.status(201).send('Admin registered successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});







module.exports = router;
