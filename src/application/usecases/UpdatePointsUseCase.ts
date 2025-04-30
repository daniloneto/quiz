import ProfileRepository from '../../domain/repositories/ProfileRepository';
import LevelCalculatorService from '../../domain/services/LevelCalculatorService';
/**
 * Use case to update user points and level.
 */
class UpdatePointsUseCase {
  private profileRepository: ProfileRepository;
  private levelCalculator: LevelCalculatorService;

  constructor({ profileRepository, levelCalculator }: { profileRepository: ProfileRepository; levelCalculator: LevelCalculatorService }) {
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
  async execute({ userId, points }: { userId: string; points: number }): Promise<{ nivel: number }> {
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

export default UpdatePointsUseCase;