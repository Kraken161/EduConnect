const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

// Fetch all bookings
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Post a new demo booking request
router.post('/', async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        await newBooking.save();

        // Find teacher phone to send a notification block
        const teacher = await Teacher.findOne({ name: req.body.teacherName });
        if (teacher) {
            const alert = new Notification({
                recipientPhone: teacher.phone,
                message: `🔔 New demo class booking request received from ${req.body.studentName}!`
            });
            await alert.save();
        }

        res.status(201).json(newBooking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH change status (Accept/Decline)
router.patch('/:id', async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        
        // Notify the student about acceptance/decline state adjustments
        const alert = new Notification({
            recipientPhone: booking.studentPhone,
            message: `📅 Your booking request with Mentor ${booking.teacherName} has been ${booking.status.toLowerCase()}!`
        });
        await alert.save();

        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete booking
router.delete('/:id', async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: "Booking drop complete." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;