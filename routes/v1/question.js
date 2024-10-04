const express = require('express');
const questionController = require('../../controllers/questionController');
const { authenticateToken,verifyApiKey } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.put('/', authenticateToken,verifyApiKey, questionController.updateQuestion);
router.post('/', authenticateToken,verifyApiKey, questionController.addQuestion);
router.delete('/', authenticateToken,verifyApiKey, questionController.deleteQuestion);

module.exports = router;