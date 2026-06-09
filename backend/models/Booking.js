const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  teacherName: { type: String, required: true },
  studentName: { type: String, default: "Guest Student" }, 
  studentPhone: { type: String, required: true }, 
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { 
    type: String, 
    default: 'Pending', 
    enum: ['Pending', 'Confirmed', 'Cancelled'] 
  },
  // PHASE 1 OVERHAUL: New Data Fields
  meetingLink: { type: String, default: "" },
  waitTime: { type: Number, default: 0 } // 0 means "Start Now", 10-60 means scheduled delay
}, { timestamps: true }); 

module.exports = mongoose.model('Booking', bookingSchema);