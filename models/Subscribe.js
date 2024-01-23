const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the User schema
const SubscribeSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
 
}, {
    timestamps: true 
});




// Compile and export the model
module.exports = mongoose.model('Subscribe', SubscribeSchema);
