const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  teacherName: { type: String, required: true },
  studentName: { type: String, default: "Guest Student" }, // Kept from your old code
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { 
    type: String, 
    default: 'Pending', 
    enum: ['Pending', 'Confirmed', 'Cancelled'] 
  }
}, { timestamps: true }); // This replaces createdAt and adds an updatedAt automatically

module.exports = mongoose.model('Booking', bookingSchema);