const express = require('express');
const examsController = require('../../controllers/examsController');
const { authenticateToken,verifyApiKey } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.get('/:title/quiz/:index', authenticateToken,verifyApiKey, examsController.getQuizByIndex);
router.post('/', authenticateToken,verifyApiKey, examsController.createExam);
router.get('/', authenticateToken,verifyApiKey, examsController.getAllExams);
router.delete('/:id', authenticateToken,verifyApiKey, examsController.deleteExam);

module.exports = router;
