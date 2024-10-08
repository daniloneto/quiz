const jwt = require('jsonwebtoken');
require('dotenv').config();

const secretKey = process.env.JWT_SECRET_KEY;
const apiKey = process.env.API_KEY;

function authenticateToken (req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function verifyApiKey (req, res, next) {
  const apiKeyHeader = req.headers['x-api-key'];
  if (apiKeyHeader !== apiKey) {
    return res.status(403).json({ message: 'Acesso negado' });
  }
  next();
}

module.exports = { authenticateToken, verifyApiKey };
