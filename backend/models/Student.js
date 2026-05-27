const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true }, // unique prevents duplication clusters
    password: { type: String, required: true },
    educationLevel: { type: String },
    specificClass: { type: String },
    location: { type: String } // City/Town reference tracking
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);