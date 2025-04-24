const jwt = require('jsonwebtoken');

/**
 * Service for signing and verifying JWT tokens.
 */
class JwtService {
  sign(payload, options = {}) {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, options);
  }

  verify(token) {
    return jwt.verify(token, process.env.JWT_SECRET_KEY);
  }
}

module.exports = JwtService;