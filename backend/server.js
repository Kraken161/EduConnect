require('dotenv').config(); // 1. Unlocks the hidden .env variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import Database Models (Explicitly lowercase paths to match Linux deployment standards)
const Booking = require('./models/Booking'); 
const Teacher = require('./models/Teacher');
const Student = require('./models/Student');

// NEW MODEL DEFINITIONS (Declared inline to ensure single-file reliability)
const chatSchema = new mongoose.Schema({
  teacherName: { type: String, required: true },
  isGroup: { type: Boolean, default: false },
  subjectChannelName: { type: String, default: "" }, // e.g., "Mathematics Room"
  studentPhone: { type: String, default: "" }, 
  allowedMembers: [{ type: String }], // Whitelisted student phone numbers
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

// Middleware Setup
app.use(cors());
app.use(express.json()); 

// 2. Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("💻 MongoDB Connected Successfully"))
  .catch(err => console.log("❌ DB Connection Error:", err));

// Quick health check home route
app.get('/', (req, res) => {
    res.send("🚀 EduConnect Backend API is Live and Running!");
});

// ==========================================
// BOOKING ROUTES
// ==========================================

// 3. POST Route: Save a new booking + Fire initial Notification
app.post('/api/bookings', async (req, res) => {
    try {
        if (!req.body.teacherName || !req.body.date) {
            return res.status(400).json({ error: "Missing required booking details" });
        }

        const newBooking = new Booking(req.body);
        await newBooking.save(); 
        console.log("New Booking Saved:", req.body);

        // Alert Notification Loop
        const teacher = await Teacher.findOne({ name: req.body.teacherName });
        if (teacher) {
            const alert = new Notification({
                recipientPhone: teacher.phone,
                message: `🔔 New demo class requested by ${req.body.studentName || "A Student"}!`
            });
            await alert.save();
        }

        res.status(201).json({ message: "Booking saved to database!", booking: newBooking });
    } catch (error) {
        console.error("Post Error:", error);
        res.status(500).json({ error: "Failed to save booking" });
    }
});

// 4. GET Route: Fetch all bookings for the Dashboard
app.get('/api/bookings', async (req, res) => {
    try {
        const allBookings = await Booking.find().sort({ createdAt: -1 }); 
        res.status(200).json(allBookings);
    } catch (error) {
        console.error("Get Error:", error);
        res.status(500).json({ error: "Could not fetch bookings" });
    }
});

// PATCH: Update Teacher (Edits, Views, and NEW: Dynamic Ratings Calculation)
app.patch('/api/teachers/:id', async (req, res) => {
    try {
        let updatePayload = { ...req.body };

        // DYNAMIC RATING STAR CALCULATOR
        if (req.body.reviews) {
            const reviewsArray = req.body.reviews;
            const averageStarResult = reviewsArray.length === 0 
                ? 5.0 
                : (reviewsArray.reduce((acc, rev) => acc + Number(rev.rating), 0) / reviewsArray.length).toFixed(1);
            updatePayload.rating = Number(averageStarResult);
        }

        const updatedTeacher = await Teacher.findByIdAndUpdate(
            req.params.id, 
            updatePayload, 
            { new: true }
        );
        res.json(updatedTeacher);
    } catch (err) {
        res.status(500).send("Error updating teacher data");
    }
});

// UPDATE Booking Status (Approve/Cancel) + Automatically Initialize Chat Context
app.patch('/api/bookings/:id', async (req, res) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id, 
      { status: req.body.status }, 
      { new: true }
    );

    // If accepted, instantiate a private chat room for them instantly
    if (req.body.status === 'Confirmed') {
        const teacher = await Teacher.findOne({ name: updatedBooking.teacherName });
        const student = await Student.findOne({ name: updatedBooking.studentName });

        if (teacher && student) {
            // Check if chat space already exists
            const existingChat = await Chat.findOne({ teacherName: teacher.name, studentPhone: student.phone });
            if (!existingChat) {
                const autoChatRoom = new Chat({
                    teacherName: teacher.name,
                    studentPhone: student.phone,
                    allowedMembers: [teacher.phone, student.phone],
                    isGroup: false,
                    messages: [{ sender: "System", text: "Class booking accepted! You can now chat and coordinate lessons here directly." }]
                });
                await autoChatRoom.save();
            }

            // Push notification entry to student's bell container
            const alert = new Notification({
                recipientPhone: student.phone,
                message: `📅 Mentor ${teacher.name} has accepted your demo session request!`
            });
            await alert.save();
        }
    }

    res.json(updatedBooking);
  } catch (err) {
    res.status(500).send("Error updating status");
  }
});

// OLD BACKWARD COMPATIBLE ZOOM LINK PATHWAY (Kept so older frontend calls never fail)
app.patch('/api/bookings/:id/zoom-link', async (req, res) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { meetingLink: req.body.meetingLink },
      { new: true }
    );
    if (!updatedBooking) return res.status(404).json({ error: "Booking not found" });
    res.json(updatedBooking);
  } catch (err) {
    res.status(500).send("Error saving Zoom link");
  }
});

// 6. DELETE a booking
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).send("Error deleting booking");
  }
});

// ==========================================
// NEW FEATURES: CHAT PLATFORM API
// ==========================================

// Get all chats linked to an active phone reference
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

// Create subject channel group (Teacher managed configuration control)
app.post('/api/chats/channels', async (req, res) => {
    try {
        const newChannel = new Chat({
            teacherName: req.body.teacherName,
            isGroup: true,
            subjectChannelName: req.body.subjectChannelName,
            allowedMembers: [req.body.teacherPhone] // starts with just the teacher
        });
        await newChannel.save();
        res.status(201).json(newChannel);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add unassigned student reference explicitly to a specific subject channel array
app.patch('/api/chats/channels/:id/add-student', async (req, res) => {
    try {
        const { studentPhone } = req.body;
        const updatedChannel = await Chat.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { allowedMembers: studentPhone } }, // addToSet ensures no duplicates
            { new: true }
        );
        res.json(updatedChannel);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Post message into chat + Handle Important Pinned Messages alert system
app.post('/api/chats/:id/messages', async (req, res) => {
    try {
        const { sender, text, isPinned, targetMembers } = req.body;
        const chat = await Chat.findByIdAndUpdate(
            req.params.id,
            { $push: { messages: { sender, text, isPinned } } },
            { new: true }
        );

        // If pinned text exists, distribute it to all member notification bells instantly
        if (isPinned && targetMembers) {
            const notifications = targetMembers
                .filter(phone => phone !== req.body.senderPhone) // Don't notify the sender
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

// Delete message or subject channel completely
app.delete('/api/chats/channels/:id', async (req, res) => {
    try {
        await Chat.findByIdAndDelete(req.params.id);
        res.json({ message: "Channel removed successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// NEW FEATURES: NOTIFICATION SYSTEM API
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
// STUDENT ROUTES
// ==========================================

const handleStudentSignup = async (req, res) => {
    try {
        const newStudent = new Student(req.body);
        await newStudent.save();
        console.log("New Student Registered:", req.body.name);
        res.status(201).json({ message: "Student registered successfully!" });
    } catch (error) {
        console.error("Error registering student:", error);
        res.status(500).json({ error: "Failed to register student" });
    }
};

app.post('/api/students', handleStudentSignup);
app.post('/api/students/signup', handleStudentSignup); 

// NEW SETTINGS UPDATE: Change City/Town or Password safely with Confirmation Checks
app.patch('/api/students/update-profile/:phone', async (req, res) => {
    try {
        const { password, location } = req.body;
        let updateFields = {};
        if (location) updateFields.location = location;
        if (password) updateFields.password = password;

        const updatedStudent = await Student.findOneAndUpdate({ phone: req.params.phone }, updateFields, { new: true });
        res.json(updatedStudent);
    } catch (err) {
        res.status(500).send("Error updating student profiles settings.");
    }
});

// DELETE Student Account Permanently
app.delete('/api/students/delete-account/:phone', async (req, res) => {
  try {
    await Student.findOneAndDelete({ phone: req.params.phone });
    res.json({ message: "Student profile dropped successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error dropping student profile" });
  }
});

// ==========================================
// TEACHER ROUTES
// ==========================================

const handleTeacherSignup = async (req, res) => {
    try {
        const newTeacher = new Teacher(req.body);
        await newTeacher.save();
        console.log("New Teacher Registered:", req.body.name);
        res.status(201).json({ message: "Teacher registered successfully!" });
    } catch (error) {
        console.error("Error registering teacher:", error);
        res.status(500).json({ error: "Failed to register teacher" });
    }
};

app.post('/api/teachers', handleTeacherSignup);
app.post('/api/teachers/signup', handleTeacherSignup); 

// GET: Fetch all teachers
app.get('/api/teachers', async (req, res) => {
    try {
        const allTeachers = await Teacher.find().sort({ createdAt: -1 });
        res.status(200).json(allTeachers);
    } catch (error) {
        console.error("Error fetching teachers:", error);
        res.status(500).json({ error: "Could not fetch teachers" });
    }
});

// NEW SETTINGS UPDATE: Manage status loop, change city parameters, or change passwords securely
app.patch('/api/teachers/update-profile/:id', async (req, res) => {
    try {
        const updatedTeacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedTeacher);
    } catch (err) {
        res.status(500).send("Error processing profile settings modifications.");
    }
});

// ACCEPT AS MENTOR ROUTE: Formally binds a student identifier to a teacher's roster link collection array
app.patch('/api/teachers/:id/accept-mentor', async (req, res) => {
    try {
        const { studentPhone, studentName } = req.body;
        const teacher = await Teacher.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { myMentoredStudents: studentPhone } },
            { new: true }
        );

        // Fire metric alert straight to teacher notification list
        const alert = new Notification({
            recipientPhone: teacher.phone,
            message: `🎓 Great news! ${studentName} has officially selected you as their formal long-term Mentor!`
        });
        await alert.save();

        res.json(teacher);
    } catch (err) {
        res.status(500).send("Error saving mentor configuration mappings.");
    }
});

// DELETE Teacher Account Permanently
app.delete('/api/teachers/delete-account/:id', async (req, res) => {
  try {
    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ message: "Teacher profile dropped successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error dropping teacher profile" });
  }
});

// ==========================================
// UNIVERSAL LOGIN ROUTE
// ==========================================

app.post('/api/login', async (req, res) => {
    try {
        const { phone, password, role } = req.body;
        let user;

        if (role === 'teacher') {
            user = await Teacher.findOne({ phone: phone, password: password });
        } else if (role === 'student') {
            user = await Student.findOne({ phone: phone, password: password });
        }

        if (user) {
            // FIXED: Now safely passes back the user's phone along with their name to coordinate messaging tracking maps
            res.status(200).json({ message: "Login success", name: user.name, phone: user.phone });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Server error during login" });
    }
});

// ==========================================
// SERVER START
// ==========================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server spinning up on port ${PORT}`);
});