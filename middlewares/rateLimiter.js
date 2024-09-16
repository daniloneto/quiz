const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

const loginLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutos
  max: 10,
  handler: (req, res) => {
    res.status(429).json({ message: 'Você excedeu o limite de requisições. Tente novamente mais tarde.' });
  },
});

const speedLimiter = slowDown({
  windowMs: 2 * 60 * 1000, // 2 minutos
  delayAfter: 3,
  delayMs: () => 1000,
});

module.exports = { loginLimiter, speedLimiter };
