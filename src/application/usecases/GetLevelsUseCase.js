/**
 * Use case to retrieve all level configurations.
 */
class GetLevelsUseCase {
  constructor({ profileRepository }) {
    this.profileRepository = profileRepository;
  }

  /**
   * Execute retrieval of levels.
   * @returns {Promise<Array<object>>}
   */
  async execute() {
    return this.profileRepository.getLevels();
  }
}

module.exports = GetLevelsUseCase;