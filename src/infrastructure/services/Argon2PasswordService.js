import argon2 from 'argon2';

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

export default Argon2PasswordService;