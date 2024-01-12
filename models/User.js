const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the User schema
const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    companyName: {
        type: String,
        trim: true
    },
    designation: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    mobile: {
        type: String,
        trim: true,
        required: true,
    },
    website: {
        type: String,
        trim: true
    },
    linkedin: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    aboutCompany: {
        type: String,
        trim: true
    },
    remarks: {
        type: String,
        trim: true
    },
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

// Compile and export the model
module.exports = mongoose.model('User', userSchema);
