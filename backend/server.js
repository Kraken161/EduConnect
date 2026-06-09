require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import Database Models
const Booking = require('./models/Booking'); 
const Teacher = require('./models/Teacher');
const Student = require('./models/Student');

// NEW MODEL DEFINITIONS
const chatSchema = new mongoose.Schema({
  teacherName: { type: String, required: true },
  isGroup: { type: Boolean, default: false },
  subjectChannelName: { type: String, default: "" }, 
  studentPhone: { type: String, default: "" }, 
  studentName: { type: String, default: "Student" }, 
  allowedMembers: [{ type: String }], 
  messages: [{
    sender: { type: String, required: true },
    text: { type: String, required: true },
    isPinned: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });
const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema);

const notificationSchema = new mongoose.Schema({
  recipientPhone: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

const app = express();

app.use(cors());
app.use(express.json()); 

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("💻 MongoDB Connected Successfully"))
  .catch(err => console.log("❌ DB Connection Error:", err));

app.get('/', (req, res) => {
    res.send("🚀 EduConnect Backend API is Live and Running!");
});

// ==========================================
// BOOKING & INTERACTIVE CHAT REQUEST ROUTES
// ==========================================

app.post('/api/bookings', async (req, res) => {
    try {
        const { teacherName, studentName, studentPhone, date, time, status } = req.body;
        if (!teacherName || !studentPhone) {
            return res.status(400).json({ error: "Missing required details: teacherName and studentPhone are mandatory." });
        }

        const newBooking = new Booking({
            teacherName,
            studentName: studentName || "Guest Student",
            studentPhone,
            date,
            time,
            status: status || 'Pending'
        });

        await newBooking.save(); 

        const teacher = await Teacher.findOne({ name: teacherName });
        if (teacher) {
            const alert = new Notification({
                recipientPhone: teacher.phone,
                message: date === "Chat Request Thread" 
                  ? `✉️ ${studentName} sent you a private Chat Request! Accept it to open a text thread.`
                  : `🔔 New demo class requested by ${studentName} on ${date}!`
            });
            await alert.save();
        }

        res.status(201).json({ message: "Request saved successfully!", booking: newBooking });
    } catch (error) {
        console.error("Post Error:", error);
        res.status(500).json({ error: "Failed to save request payload to database." });
    }
});

app.get('/api/bookings', async (req, res) => {
    try {
        const allBookings = await Booking.find().sort({ createdAt: -1 }); 
        res.status(200).json(allBookings);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch bookings" });
    }
});

app.patch('/api/teachers/:id', async (req, res) => {
    try {
        let updatePayload = { ...req.body };
        if (req.body.reviews) {
            const reviewsArray = req.body.reviews;
            const averageStarResult = reviewsArray.length === 0 
                ? 5.0 
                : (reviewsArray.reduce((acc, rev) => acc + Number(rev.rating), 0) / reviewsArray.length).toFixed(1);
            updatePayload.rating = Number(averageStarResult);
        }

        const updatedTeacher = await Teacher.findByIdAndUpdate(req.params.id, updatePayload, { new: true });
        res.json(updatedTeacher);
    } catch (err) {
        res.status(500).send("Error updating teacher data");
    }
});

app.patch('/api/bookings/:id', async (req, res) => {
  try {
    const { status, meetingLink, waitTime } = req.body; 

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id, 
      { status, meetingLink, waitTime }, 
      { new: true }
    );

    if (status === 'Confirmed') {
        const teacher = await Teacher.findOne({ name: updatedBooking.teacherName });
        
        if (teacher && updatedBooking.studentPhone) {
            
            const existingChat = await Chat.findOne({ 
                teacherName: teacher.name, 
                studentPhone: updatedBooking.studentPhone,
                isGroup: false 
            });

            if (!existingChat) {
                const autoChatRoom = new Chat({
                    teacherName: teacher.name,
                    studentPhone: updatedBooking.studentPhone,
                    studentName: updatedBooking.studentName,
                    allowedMembers: [teacher.phone, updatedBooking.studentPhone],
                    isGroup: false,
                    messages: [{ 
                        sender: "System", 
                        text: `Connection accepted! 🤝\nDemo Class Link: ${meetingLink ? meetingLink : 'To be shared shortly.'}` 
                    }]
                });
                await autoChatRoom.save();
            }

            let notificationMsg = "";
            if (waitTime === 0) {
                notificationMsg = `🚀 Instructor ${teacher.name} accepted your demo request! Class starts NOW. Open your Class Chats to grab the Zoom link.`;
            } else {
                notificationMsg = `⏳ Instructor ${teacher.name} accepted your demo! Class will begin in ${waitTime} minutes. Check your Class Chats for the link!`;
            }

            const alert = new Notification({
                recipientPhone: updatedBooking.studentPhone,
                message: notificationMsg
            });
            await alert.save();
        }
    }

    res.json(updatedBooking);
  } catch (err) {
    console.error("Booking Patch Error:", err);
    res.status(500).send("Error updating booking status loops");
  }
});

app.delete('/api/bookings/:id', async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).send("Error deleting booking");
  }
});

// ==========================================
// CHAT PLATFORM CORE ROUTES
// ==========================================

app.get('/api/chats/:phone', async (req, res) => {
    try {
        const chats = await Chat.find({
            $or: [
                { studentPhone: req.params.phone },
                { allowedMembers: req.params.phone },
                { teacherName: req.query.userName }
            ]
        }).sort({ updatedAt: -1 });
        res.json(chats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/chats/channels', async (req, res) => {
    try {
        const newChannel = new Chat({
          teacherName: req.body.teacherName,
          isGroup: true,
          subjectChannelName: req.body.subjectChannelName,
          allowedMembers: [req.body.teacherPhone] 
        });
        await newChannel.save();
        res.status(201).json(newChannel);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// FIXED: Removed the mentor restriction completely. Teachers can add any student.
app.patch('/api/chats/channels/:id/add-student', async (req, res) => {
    try {
        const { studentPhone } = req.body;
        const channelRoom = await Chat.findById(req.params.id);
        if (!channelRoom) return res.status(404).json({ error: "Channel room missing" });

        const updatedChannel = await Chat.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { allowedMembers: studentPhone } }, 
            { new: true }
        );
        res.json(updatedChannel);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/chats/channels/:id/leave', async (req, res) => {
    try {
        const { studentPhone } = req.body;
        const updatedChannel = await Chat.findByIdAndUpdate(
            req.params.id,
            { $pull: { allowedMembers: studentPhone } }, 
            { new: true }
        );
        res.json(updatedChannel);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/chats/:id/messages', async (req, res) => {
    try {
        const { sender, text, isPinned, targetMembers } = req.body;
        const chat = await Chat.findByIdAndUpdate(
            req.params.id,
            { $push: { messages: { sender, text, isPinned } } },
            { new: true }
        );

        if (isPinned && targetMembers) {
            const notifications = targetMembers
                .filter(phone => phone !== req.body.senderPhone) 
                .map(phone => ({
                    recipientPhone: phone,
                    message: `📌 Pinned Update in ${chat.isGroup ? chat.subjectChannelName : "Private Chat"}: "${text}"`
                }));
            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
            }
        }
        res.json(chat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/chats/:chatId/messages/:msgId', async (req, res) => {
    try {
        const chat = await Chat.findByIdAndUpdate(
            req.params.chatId,
            { $pull: { messages: { _id: req.params.msgId } } },
            { new: true }
        );
        res.json(chat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/chats/channels/:id', async (req, res) => {
    try {
        await Chat.findByIdAndDelete(req.params.id);
        res.json({ message: "Channel removed successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// NOTIFICATION BADGES ROUTES
// ==========================================

app.get('/api/notifications/:phone', async (req, res) => {
    try {
        const alerts = await Notification.find({ recipientPhone: req.params.phone }).sort({ createdAt: -1 });
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/notifications/clear/:phone', async (req, res) => {
    try {
        await Notification.updateMany({ recipientPhone: req.params.phone }, { isRead: true });
        res.json({ message: "Red dots cleared successfully." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// AUTHENTICATION & SETTINGS PROFILES LINKING
// ==========================================

app.patch('/api/students/update-profile/:phone', async (req, res) => {
    try {
        const { password, location } = req.body;
        let updateFields = {};
        if (location) updateFields.location = location;
        if (password) updateFields.password = password;

        const updatedStudent = await Student.findOneAndUpdate({ phone: req.params.phone }, updateFields, { new: true });
        res.json(updatedStudent);
    } catch (err) {
        res.status(500).send("Error updating settings profile parameters.");
    }
});

app.delete('/api/students/delete-account/:phone', async (req, res) => {
  try {
    await Student.findOneAndDelete({ phone: req.params.phone });
    res.json({ message: "Student account removed safely" });
  } catch (error) {
    res.status(500).json({ error: "Failed to erase account trace." });
  }
});

app.patch('/api/teachers/update-profile/:id', async (req, res) => {
    try {
        const updatedTeacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedTeacher);
    } catch (err) {
        res.status(500).send("Profile patch transaction error.");
    }
});

app.delete('/api/teachers/delete-account/:id', async (req, res) => {
  try {
    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ message: "Teacher account removed safely" });
  } catch (error) {
    res.status(500).json({ error: "Failed to erase account trace." });
  }
});

app.post('/api/login', async (req, res) => {
    try {
        const { phone, password, role } = req.body;
        let user;
        if (role === 'teacher') user = await Teacher.findOne({ phone, password });
        else user = await Student.findOne({ phone, password });

        if (user) {
            res.status(200).json({ message: "Login success", name: user.name, phone: user.phone });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).json({ error: "Server error during login" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server spinning up on port ${PORT}`);
});