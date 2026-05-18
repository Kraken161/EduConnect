require('dotenv').config(); // 1. Unlocks the hidden .env variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import Database Models (FIXED: Explicitly lowercase paths to match Linux deployment standards)
const Booking = require('./models/booking'); 
const Teacher = require('./models/teacher');
const Student = require('./models/student');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); 

// 2. Database Connection (Now perfectly secured!)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("💻 MongoDB Connected Successfully"))
  .catch(err => console.log("❌ DB Connection Error:", err));

// Quick health check home route so your base Render URL doesn't say "Not Found" anymore
app.get('/', (req, res) => {
    res.send("🚀 EduConnect Backend API is Live and Running!");
});

// ==========================================
// BOOKING ROUTES
// ==========================================

// 3. POST Route: Save a new booking
app.post('/api/bookings', async (req, res) => {
    try {
        if (!req.body.teacherName || !req.body.date) {
            return res.status(400).json({ error: "Missing required booking details" });
        }

        const newBooking = new Booking(req.body);
        await newBooking.save(); 
        console.log("New Booking Saved:", req.body);
        res.status(201).json({ message: "Booking saved to database!" });
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

// PATCH: Update Teacher (Edits, Views, and Reviews)
app.patch('/api/teachers/:id', async (req, res) => {
    try {
        const updatedTeacher = await Teacher.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );
        res.json(updatedTeacher);
    } catch (err) {
        res.status(500).send("Error updating teacher data");
    }
});

// 5. UPDATE Status (Approve/Cancel)
app.patch('/api/bookings/:id', async (req, res) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id, 
      { status: req.body.status }, 
      { new: true }
    );
    res.json(updatedBooking);
  } catch (err) {
    res.status(500).send("Error updating status");
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
// STUDENT ROUTES
// ==========================================

// FIXED: Handles BOTH standard and alternative registration paths seamlessly
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
app.post('/api/students/signup', handleStudentSignup); // Handles your frontend URL structure!

// ==========================================
// TEACHER ROUTES
// ==========================================

// FIXED: Handles BOTH standard and alternative teacher registration paths seamlessly
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
app.post('/api/teachers/signup', handleTeacherSignup); // Handles your frontend URL structure!

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
            res.status(200).json({ message: "Login success", name: user.name });
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