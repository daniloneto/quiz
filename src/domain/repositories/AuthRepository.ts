  /**
   * Find a user by username.
   * @param {string} username
   */

/**
 * Abstract repository for authentication operations.
 */
export default abstract class AuthRepository {
  /** Find a user by username. */
  abstract findUserByUsername(username: string): Promise<any>;

  /**
   * Find a profile by email.
   * @param {string} email
   */
  /** Find a profile by email. */
  abstract findProfileByEmail(email: string): Promise<any>;

  /**
   * Save a new user entity.
   * @param {object} userEntity
   */
  /** Save a new user entity. */
  abstract saveUser(userEntity: any): Promise<any>;

  /**
   * Save a new profile entity.
   * @param {object} profileEntity
   */
  /** Save a new profile entity. */
  abstract saveProfile(profileEntity: any): Promise<any>;

  /**
   * Find a profile by user ID.
   * @param {string} id
   */
  /** Find a profile by user ID. */
  abstract findProfileById(id: string): Promise<any>;

  /**
   * Find a profile by verification token.
   * @param {string} token
   */
  /** Find a profile by verification token. */
  abstract findProfileByToken(token: string): Promise<any>;

  /**
   * Save a password reset token record.
   * @param {object} tokenRecord
   */
  /** Save a password reset token record. */
  abstract savePasswordResetToken(tokenRecord: any): Promise<void>;

  /**
   * Find a password reset token record.
   * @param {string} token
   */
  /** Find a password reset token record. */
  abstract findPasswordResetToken(token: string): Promise<any>;

  /**
   * Mark a password reset token as used.
   * @param {string} token
   */
  /** Mark a password reset token as used. */
  abstract markPasswordResetTokenUsed(token: string): Promise<boolean>;

  /**
   * Update the last login timestamp for a user.
   * @param {string} userId
   * @param {Date} timestamp
   */
  /** Update the last login timestamp for a user. */
  abstract updateLastLogin(userId: string, timestamp: Date): Promise<void>;

  /**
   * Update the timestamp of the last password reset request.
   * @param {string} userId
   * @param {Date} timestamp
   */
  /** Update the timestamp of the last password reset request. */
  abstract updatePasswordResetRequest(userId: string, timestamp: any): Promise<any>;

  /**
   * Activate a user and profile by ID.
   * @param {string} userId
   */
  /** Activate a user and profile by ID. */
  abstract activateUser(userId: string): Promise<boolean>;

  /**
   * Update a user's password.
   * @param {string} userId
   * @param {string} hashedPassword
   */
  /** Update a user's password. */
  abstract updateUserPassword(userId: string, hashedPassword: string): Promise<boolean>;
}