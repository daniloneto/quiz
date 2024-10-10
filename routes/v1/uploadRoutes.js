const express = require('express');
const { processUpload } = require('../../controllers/uploadController');
const { authenticateToken,verifyApiKey } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.post('/gpt-integration', authenticateToken,verifyApiKey, processUpload);

module.exports = router;