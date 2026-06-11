const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    location: { type: String, required: true },
    degree: { type: String, required: true },
    teachingLevel: { type: String }, 
    subjects: [{ type: String }], 
    bio: { type: String },
    status: { type: String, default: 'Active & Visible' }, 
    rating: { type: Number, default: 5.0 }, 
    profileViews: { type: Number, default: 0 },
    viewedBy: { type: Array, default: [] },
    reviews: [{
        id: { type: Number },
        name: { type: String },
        rating: { type: Number },
        text: { type: String },
        createdAt: { type: Date, default: Date.now }
    }],
    myMentoredStudents: [{ type: String }] 
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);