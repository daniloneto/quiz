import ProfileRepository from '../../domain/repositories/ProfileRepository';
/**
 * Use case to retrieve all level configurations.
 */
class GetLevelsUseCase {
  private profileRepository: ProfileRepository;

  constructor({ profileRepository }: { profileRepository: ProfileRepository }) {
    this.profileRepository = profileRepository;
  }

  /**
   * Execute retrieval of levels.
   * @returns {Promise<Array<object>>}
   */
  async execute(): Promise<any[]> {
    return this.profileRepository.getLevels();
  }
}

export default GetLevelsUseCase;