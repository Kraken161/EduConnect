const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// UNIVERSAL LOGIN ENGINE
router.post('/login', async (req, res) => {
    try {
        const { phone, password, role } = req.body;
        let user;
        if (role === 'teacher') user = await Teacher.findOne({ phone, password });
        else user = await Student.findOne({ phone, password });

        if (user) res.status(200).json({ message: "Login success", name: user.name, phone: user.phone });
        else res.status(401).json({ error: "Invalid phone mapping or password parameters." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// STUDENT PROFILE ROUTING PIPELINE
router.post('/students', async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).json(student);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/students/delete-account/:phone', async (req, res) => {
    try {
        await Student.findOneAndDelete({ phone: req.params.phone });
        res.json({ message: "Account clearance complete." });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// TEACHER PROFILE ROUTING PIPELINE
router.get('/teachers', async (req, res) => {
    try {
        const teachers = await Teacher.find().sort({ createdAt: -1 });
        res.json(teachers);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/teachers', async (req, res) => {
    try {
        const teacher = new Teacher(req.body);
        await teacher.save();
        res.status(201).json(teacher);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Dynamic Star Update & Settings Patch Logic Combo Engine
router.patch('/teachers/:id', async (req, res) => {
    try {
        let updateData = { ...req.body };
        
        // Dynamic Rating Star Aggregator Math Integration Check
        if (req.body.reviews) {
            const arr = req.body.reviews;
            const avg = arr.length === 0 ? 5.0 : (arr.reduce((acc, r) => acc + Number(r.rating), 0) / arr.length).toFixed(1);
            updateData.rating = Number(avg);
        }

        const teacher = await Teacher.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(teacher);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/teachers/delete-account/:id', async (req, res) => {
    try {
        await Teacher.findByIdAndDelete(req.params.id);
        res.json({ message: "Teacher account dropped cleanly." });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;