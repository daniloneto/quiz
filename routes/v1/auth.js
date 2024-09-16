const express = require('express');
const { loginLimiter, speedLimiter } = require('../middlewares/rateLimiter');
const { verifyOrigin } = require('../middlewares/verifyOrigin');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/proxy-login', loginLimiter, speedLimiter, verifyOrigin, authController.proxyLogin);
router.post('/api/v1/register', authController.register);
router.post('/api/v1/login', loginLimiter, speedLimiter, express.urlencoded({ extended: true }), authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
