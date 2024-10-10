const express = require('express');
const authRoutes = require('./authRoutes');
const examsRoutes = require('./exam');
const quizRoutes = require('./quiz');
const backupRoutes = require('./backup');
const profileRoutes = require('./profile');
const questionRoutes = require('./question');
const uploadRoutes = require('./uploadRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/exams', examsRoutes);
router.use('/quiz', quizRoutes);
router.use('/backup', backupRoutes);
router.use('/profile', profileRoutes);
router.use('/question',questionRoutes);
router.use('/upload', uploadRoutes);

module.exports = router;
