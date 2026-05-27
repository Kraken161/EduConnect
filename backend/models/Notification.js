const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientPhone: { type: String, required: true }, // Targeted listener phone
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false } // Trigger control logic mapping
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);