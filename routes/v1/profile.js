const express = require('express');
const profileController = require('../../controllers/profileController');
const { authenticateToken,verifyApiKey } = require('../../middlewares/authMiddleware');
const router = express.Router();

router.get('/id/:id', authenticateToken, verifyApiKey, profileController.getProfile);
router.post('/atualizar-pontos', authenticateToken, verifyApiKey, profileController.atualizarPontos);
router.get('/levels',authenticateToken,verifyApiKey, profileController.getLevels);

module.exports = router;
