const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    used: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

// Index to automatically remove OTP document after expiration
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Optional: Method to validate OTP expiration
otpSchema.methods.isExpired = function() {
    return new Date() > this.expiresAt;
};

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
