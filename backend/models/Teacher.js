const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    location: { type: String, required: true },
    degree: { type: String, required: true },
    
    teachingLevel: { type: String }, 
    subjects: [{ type: String }], 
    bio: { type: String },
    rating: { type: Number, default: 5 }, 
    
    profileViews: { type: Number, default: 0 },
    // NEW: Array to remember which students have already viewed this profile
    viewedBy: { type: Array, default: [] },
    reviews: { type: Array, default: [] } 
    
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);