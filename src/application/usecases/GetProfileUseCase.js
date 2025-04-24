/**
 * Use case to retrieve a user profile by ID.
 */
class GetProfileUseCase {
  constructor({ profileRepository }) {
    this.profileRepository = profileRepository;
  }

  /**
   * Execute retrieval of profile.
   * @param {object} params
   * @param {string} params.id
   * @returns {Promise<object>} Profile data
   */
  async execute({ id }) {
    const profile = await this.profileRepository.findById(id);
    if (!profile) {
      throw new Error('Perfil não encontrado');
    }
    return profile;
  }
}

module.exports = GetProfileUseCase;