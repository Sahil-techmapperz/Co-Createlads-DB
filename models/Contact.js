const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    phoneNumber: String,
    country: String,
    companyName: String,
    interestedIn: String,
    message: String
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;