const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Fetch unread tracking collection data metrics
router.get('/:phone', async (req, res) => {
    try {
        const alerts = await Notification.find({ recipientPhone: req.params.phone }).sort({ createdAt: -1 });
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Clear red counting badge notifications by marking them read
router.patch('/clear/:phone', async (req, res) => {
    try {
        await Notification.updateMany({ recipientPhone: req.params.phone }, { isRead: true });
        res.json({ message: "Badges cleared successfully." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;