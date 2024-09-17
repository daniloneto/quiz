const express = require('express');
const backupController = require('../../controllers/backupController');
const { authenticateToken,verifyApiKey } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.get('/create', authenticateToken,verifyApiKey, backupController.createBackup);

module.exports = router;
