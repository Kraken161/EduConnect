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
  
  meetingLink: { type: String, default: "" },
  waitTime: { type: Number, default: 0 } 
}, { timestamps: true }); 

module.exports = mongoose.model('Booking', bookingSchema);