const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const Notification = require('../models/Notification');

// Fetch user related chats
router.get('/:phone', async (req, res) => {
    try {
        const phone = req.params.phone;
        // Fetch private DMs or whitelisted subject group channels
        const userChats = await Chat.find({
            $or: [
                { studentPhone: phone },
                { allowedMembers: phone },
                { teacherName: req.query.userName } // Re-check via queries fallback
            ]
        }).sort({ updatedAt: -1 });
        res.json(userChats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create single DM or subject channel group
router.post('/create', async (req, res) => {
    try {
        const newChat = new Chat(req.body);
        await newChat.save();
        res.status(201).json(newChat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Post a message and check for Pinned Alert logic
router.post('/:id/message', async (req, res) => {
    try {
        const { sender, text, isPinned, targetMembers } = req.body;
        
        const updatePayload = { sender, text, isPinned };
        const chat = await Chat.findByIdAndUpdate(
            req.params.id,
            { $push: { messages: updatePayload } },
            { new: true }
        );

        // If pinned by teacher, fire bulk alert records to notification bell collection
        if (isPinned && targetMembers) {
            const notificationDocs = targetMembers.map(phone => ({
                recipientPhone: phone,
                message: `📌 Important Pinned Update from Tutor ${chat.teacherName}: "${text}"`
            }));
            await Notification.insertMany(notificationDocs);
        }

        res.json(chat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update standard pin configuration tracking mapping directly inside an array index
router.patch('/:chatId/message/:msgId/pin', async (req, res) => {
    try {
        const chat = await Chat.findOneAndUpdate(
            { _id: req.params.chatId, "messages._id": req.params.msgId },
            { $set: { "messages.$.isPinned": req.body.isPinned } },
            { new: true }
        );
        res.json(chat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;