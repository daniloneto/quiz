const express = require('express');
const quizController = require('../../controllers/quizController');
const { authenticateToken,verifyApiKey } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authenticateToken,verifyApiKey, quizController.createQuiz);
router.post('/save-quiz-result', authenticateToken,verifyApiKey, quizController.saveQuizResult);
router.get('/quiz-results/:userId', authenticateToken,verifyApiKey, quizController.getQuizResults);

module.exports = router;
