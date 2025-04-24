/**
 * Interface for profile repository operations.
 */
class ProfileRepository {
  /**
   * Find a profile by its ID.
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    throw new Error('Method not implemented.');
  }

  /**
   * Retrieve all level configurations.
   * @returns {Promise<Array<object>>}
   */
  async getLevels() {
    throw new Error('Method not implemented.');
  }

  /**
   * Update points and level for a profile.
   * @param {string} userId
   * @param {number} points
   * @param {number} level
   */
  async updatePointsAndLevel(userId, points, level) {
    throw new Error('Method not implemented.');
  }
}

module.exports = ProfileRepository;