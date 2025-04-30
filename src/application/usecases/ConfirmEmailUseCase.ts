import AuthRepository from '../../domain/repositories/AuthRepository';
/**
 * Use case for confirming a user's email.
 */
class ConfirmEmailUseCase {
  private authRepository: AuthRepository;

  constructor({ authRepository }: { authRepository: AuthRepository }) {
    this.authRepository = authRepository;
  }

  /**
   * Execute email confirmation.
   * @param {object} params
   * @param {string} params.token
   * @returns {Promise<{message: string}>}
   */
  async execute({ token }: { token: string }): Promise<{ message: string }> {
    const profile = await this.authRepository.findProfileByToken(token);
    if (!profile) {
      throw new Error('Token não encontrado');
    }
    if (profile.ativado) {
      throw new Error('Conta já ativada.');
    }

    await this.authRepository.activateUser(profile._id);
    return { message: 'Conta ativada com sucesso.' };
  }
}

export default ConfirmEmailUseCase;