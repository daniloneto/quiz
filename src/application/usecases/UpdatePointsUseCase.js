/**
 * Use case to update user points and level.
 */
class UpdatePointsUseCase {
  constructor({ profileRepository, levelCalculator }) {
    this.profileRepository = profileRepository;
    this.levelCalculator = levelCalculator;
  }

  /**
   * Execute points update.
   * @param {object} params
   * @param {string} params.userId
   * @param {number} params.points
   * @returns {Promise<{nivel: number}>}
   */
  async execute({ userId, points }) {
    const profile = await this.profileRepository.findById(userId);
    if (!profile) {
      throw new Error('Usuário não encontrado');
    }
    const levels = await this.profileRepository.getLevels();
    const totalPoints = profile.points + points;
    const newLevel = this.levelCalculator.calculateLevel(totalPoints, levels);
    await this.profileRepository.updatePointsAndLevel(userId, totalPoints, newLevel);
    return { nivel: newLevel };
  }
}

module.exports = UpdatePointsUseCase;