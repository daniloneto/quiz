/**
 * Use case for confirming a user's email.
 */
class ConfirmEmailUseCase {
  constructor({ authRepository }) {
    this.authRepository = authRepository;
  }

  /**
   * Execute email confirmation.
   * @param {object} params
   * @param {string} params.token
   * @returns {Promise<{message: string}>}
   */
  async execute({ token }) {
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

module.exports = ConfirmEmailUseCase;