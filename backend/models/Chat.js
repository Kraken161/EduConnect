const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  teacherName: { type: String, required: true },
  isGroup: { type: Boolean, default: false },
  subjectChannelName: { type: String, default: "" }, // e.g., "Mathematics Channel"
  studentPhone: { type: String, default: "" }, // Handled explicitly if single private validation DM thread
  allowedMembers: [{ type: String }], // whitelisted array of student phone tracking references
  messages: [{
    sender: { type: String, required: true },
    text: { type: String, required: true },
    isPinned: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);