const express = require('express');
const path = require('path');
const authRoutes = require('./authRoutes');
const examsRoutes = require('./exam');
const quizRoutes = require('./quiz');
const backupRoutes = require('./backup');
const profileRoutes = require('./profile');
const questionRoutes = require('./question');

const router = express.Router();

// Rota para servir o arquivo index.html
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', 'index.html'));
});

// Outras rotas versionadas
router.use('/auth', authRoutes);
router.use('/exams', examsRoutes);
router.use('/quiz', quizRoutes);
router.use('/backup', backupRoutes);
router.use('/profile', profileRoutes);
router.use('/question',questionRoutes);

module.exports = router;
