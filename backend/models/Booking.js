const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  teacherName: { type: String, required: true },
  studentName: { type: String, default: "Guest Student" }, 
  studentPhone: { type: String, required: true }, // Essential structural link trace mapping
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { 
    type: String, 
    default: 'Pending', 
    enum: ['Pending', 'Confirmed', 'Cancelled'] 
  }
}, { timestamps: true }); 

module.exports = mongoose.model('Booking', bookingSchema);