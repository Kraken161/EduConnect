const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true }, 
    password: { type: String, required: true },
    educationLevel: { type: String },
    specificClass: { type: String },
    location: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);