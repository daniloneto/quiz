/**
 * Interface for authentication repository.
 * Defines methods for user and profile persistence operations.
 */
class AuthRepository {
  /**
   * Find a user by username.
   * @param {string} username
   */
  async findUserByUsername(username) {
    throw new Error('Method not implemented.');
  }

  /**
   * Find a profile by email.
   * @param {string} email
   */
  async findProfileByEmail(email) {
    throw new Error('Method not implemented.');
  }

  /**
   * Save a new user entity.
   * @param {object} userEntity
   */
  async saveUser(userEntity) {
    throw new Error('Method not implemented.');
  }

  /**
   * Save a new profile entity.
   * @param {object} profileEntity
   */
  async saveProfile(profileEntity) {
    throw new Error('Method not implemented.');
  }

  /**
   * Find a profile by user ID.
   * @param {string} id
   */
  async findProfileById(id) {
    throw new Error('Method not implemented.');
  }

  /**
   * Find a profile by verification token.
   * @param {string} token
   */
  async findProfileByToken(token) {
    throw new Error('Method not implemented.');
  }

  /**
   * Save a password reset token record.
   * @param {object} tokenRecord
   */
  async savePasswordResetToken(tokenRecord) {
    throw new Error('Method not implemented.');
  }

  /**
   * Find a password reset token record.
   * @param {string} token
   */
  async findPasswordResetToken(token) {
    throw new Error('Method not implemented.');
  }

  /**
   * Mark a password reset token as used.
   * @param {string} token
   */
  async markPasswordResetTokenUsed(token) {
    throw new Error('Method not implemented.');
  }

  /**
   * Update the last login timestamp for a user.
   * @param {string} userId
   * @param {Date} timestamp
   */
  async updateLastLogin(userId, timestamp) {
    throw new Error('Method not implemented.');
  }

  /**
   * Update the timestamp of the last password reset request.
   * @param {string} userId
   * @param {Date} timestamp
   */
  async updatePasswordResetRequest(userId, timestamp) {
    throw new Error('Method not implemented.');
  }

  /**
   * Activate a user and profile by ID.
   * @param {string} userId
   */
  async activateUser(userId) {
    throw new Error('Method not implemented.');
  }

  /**
   * Update a user's password.
   * @param {string} userId
   * @param {string} hashedPassword
   */
  async updateUserPassword(userId, hashedPassword) {
    throw new Error('Method not implemented.');
  }
}

module.exports = AuthRepository;