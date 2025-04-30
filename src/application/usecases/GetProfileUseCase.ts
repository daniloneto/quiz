import ProfileRepository from '../../domain/repositories/ProfileRepository';
/**
 * Use case to retrieve a user profile by ID.
 */
class GetProfileUseCase {
  private profileRepository: ProfileRepository;

  constructor({ profileRepository }: { profileRepository: ProfileRepository }) {
    this.profileRepository = profileRepository;
  }

  /**
   * Execute retrieval of profile.
   * @param {object} params
   * @param {string} params.id
   * @returns {Promise<object>} Profile data
   */
  async execute({ id }: { id: string }): Promise<any> {
    const profile = await this.profileRepository.findById(id);
    if (!profile) {
      throw new Error('Perfil não encontrado');
    }
    return profile;
  }
}

export default GetProfileUseCase;