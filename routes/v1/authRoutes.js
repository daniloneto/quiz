const express = require('express');
const authController = require('../../controllers/authController');
const { loginLimiter, speedLimiter } = require('../../middlewares/rateLimiter');
const { verifyOrigin } = require('../../middlewares/verifyOrigin');
const { authenticateToken,verifyApiKey } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.post('/proxy-login', loginLimiter, speedLimiter, verifyOrigin, authController.proxyLogin);
router.post('/register',verifyApiKey, authController.register);
router.post('/login', loginLimiter, speedLimiter, verifyApiKey, express.urlencoded({ extended: true }), authController.login);
router.post('/forgot-password',verifyApiKey, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/confirm-email', authController.confirmEmail);
router.get('/protected', authenticateToken, authController.protectedRoute);

module.exports = router;