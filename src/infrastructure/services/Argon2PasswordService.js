const argon2 = require('argon2');

/**
 * Service for hashing and verifying passwords using Argon2.
 */
class Argon2PasswordService {
  async hash(password) {
    return argon2.hash(password);
  }

  async verify(hash, password) {
    return argon2.verify(hash, password);
  }
}

module.exports = Argon2PasswordService;