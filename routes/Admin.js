const express = require('express');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const AWS = require('aws-sdk');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secure-secret';
const AdminMiddleware = require("../middlewares/AdminAuthorization_middleware")

const router = express.Router();


AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

router.get("/", (req, res) => {
    res.status(200).send("Hello from admin");
});



router.patch('/profile/profileimageupdate', AdminMiddleware, upload.single('image'), (req, res) => {
    const file = req.file;
    const { id } = req.user;  // Assuming 'id' is used to identify the admin

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

        let url = data.Location;

        // Update the profileUrl in the Admin model
        Admin.updateOne({ _id: id }, { profileUrl: url })
            .then(() => {
                // After updating, fetch the updated admin data
                return Admin.findById(id);
            })
            .then(updatedAdmin => {
                // Send back the updated admin data
                // Be cautious about sending sensitive information; omit it as necessary
                const adminDataToSend = {
                    ...updatedAdmin.toObject(), // Convert the Mongoose document to a plain object
                    profileUrl: url // Ensure the updated URL is included
                };
                delete adminDataToSend.password; // Example: remove sensitive fields like password

                res.status(200).send({ admin: adminDataToSend });
            })
            .catch(error => {
                console.error(error);
                res.status(500).send('Error updating or retrieving admin profile');
            });

    });
});

router.patch('/profile/update', AdminMiddleware, async (req, res) => {
    try {
        const { id } = req.user;
        const {
            fullName,
            email,
            username,
            phoneNumber,
            address,
            dateOfBirth,
            role,
            profileUrl
        } = req.body;

        // Constructing update data with non-null and non-undefined fields
        const updateData = {};
        if (fullName !== null && fullName !== undefined) updateData.fullName = fullName;
        if (email !== null && email !== undefined) updateData.email = email;
        if (username !== null && username !== undefined) updateData.username = username;
        if (phoneNumber !== null && phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
        if (address !== null && address !== undefined) updateData.address = address;
        if (dateOfBirth !== null && dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
        if (role !== null && role !== undefined) updateData.role = role;
        if (profileUrl !== null && profileUrl !== undefined) updateData.profileUrl = profileUrl;

        // Check if the document exists before updating
        const adminExists = await Admin.exists({ _id: id });
        if (!adminExists) {
            return res.status(404).send('Admin profile not found.');
        }

        // Update the profile in the Admin model
        const updateResult = await Admin.updateOne({ _id: id }, { $set: updateData });
        
        if (!updateResult.modifiedCount) {
            throw new Error("Profile update failed or no changes made.");
        }

        // Fetch the updated admin data
        const updatedAdmin = await Admin.findById(id);
        if (!updatedAdmin) {
            throw new Error("Failed to retrieve updated profile.");
        }

        // Be cautious about sending sensitive information; omit it as necessary
        const adminDataToSend = {
            ...updatedAdmin.toObject(),
        };
        delete adminDataToSend.password; // Remove sensitive fields like password

        res.status(200).send({ admin: adminDataToSend });
    } catch (error) {
        console.error("Error updating or retrieving admin profile:", error.message);
        res.status(500).send('Error updating or retrieving admin profile');
    }
});



// router.patch('/profile/profileimageupdate', AdminMiddleware, upload.single('image'), (req, res) => {
//     const file = req.file;
//     const { id } = req.user;  // Assuming 'id' is used to identify the admin


//     // First, retrieve the current admin data to get the existing image URL
//     Admin.findById(id)
//         .then(admin => {
//             if (admin.profileUrl) {
//                 // Extract the key (file name) from the URL
//                 const urlParts = admin.profileUrl.split('/');
//                 const key = urlParts[urlParts.length - 1];

//                 // Delete the existing file from S3
//                 const deleteParams = {
//                     Bucket: process.env.S3_BUCKET_NAME,
//                     Key: key
//                 };

//                 s3.deleteObject(deleteParams, (deleteErr, deleteData) => {
//                     if (deleteErr) {
//                         console.error(deleteErr);
//                         res.status(500).send('Error deleting old image from S3');
//                         return;
//                     }

//                     // After deleting the old image, upload the new one
//                     uploadNewImage();
//                 });
//             } else {
//                 // If there's no existing image, just upload the new one
//                 uploadNewImage();
//             }
//         })
//         .catch(error => {
//             console.error(error);
//             res.status(500).send('Error retrieving admin profile');
//         });

//     function uploadNewImage() {
//         const params = {
//             Bucket: process.env.S3_BUCKET_NAME,
//             Key: file.originalname,
//             Body: fs.createReadStream(file.path),
//             ContentType: file.mimetype,
//         };

//         s3.upload(params, (err, data) => {
//             if (err) {
//                 console.error(err);
//                 res.status(500).send('Error uploading to S3');
//                 return;
//             }

//             let url = data.Location;

//             // Update the profileUrl in the Admin model
//             Admin.updateOne({ _id: id }, { profileUrl: url })
//                 .then(() => {
//                     return Admin.findById(id);
//                 })
//                 .then(updatedAdmin => {
//                     const adminDataToSend = {
//                         ...updatedAdmin.toObject(),
//                         profileUrl: url
//                     };
//                     delete adminDataToSend.password;

//                     res.status(200).send({ admin: adminDataToSend });
//                 })
//                 .catch(error => {
//                     console.error(error);
//                     res.status(500).send('Error updating or retrieving admin profile');
//                 });
//         });
//     }
// });






// Admin login route


// router.post('/login', async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         const admin = await Admin.findOne({ email: email.toLowerCase() });
//         if (!admin) {
//             return res.status(401).send('Authentication failed');
//         }

//         const isMatch = await bcrypt.compare(password, admin.password);
//         if (!isMatch) {
//             return res.status(401).send('Authentication failed');
//         }

//         // Create session
//         res.status(200).send({"user":admin,"message":"Login Success"});
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Internal Server Error');
//     }
// });

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

        // Create JWT token
        const token = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: '1h' });

        // Send token to client
        res.status(200).send({ token, user: admin, message: "Login Successful" });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});




// Admin signup route
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;

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
            role: "Admin"
        });

        await admin.save();
        res.status(201).send('Admin registered successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});







module.exports = router;
