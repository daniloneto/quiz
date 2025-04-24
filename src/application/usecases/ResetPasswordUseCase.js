/**
 * Use case for resetting a user's password.
 */
class ResetPasswordUseCase {
  constructor({ authRepository, passwordService }) {
    this.authRepository = authRepository;
    this.passwordService = passwordService;
  }

  /**
   * Execute password reset.
   * @param {object} params
   * @param {string} params.token
   * @param {string} params.newPassword
   * @returns {Promise<{message: string}>}
   */
  async execute({ token, newPassword }) {
    const tokenRecord = await this.authRepository.findPasswordResetToken(token);
    if (!tokenRecord || tokenRecord.used) {
      throw new Error('Token inválido ou já utilizado.');
    }

    const hashed = await this.passwordService.hash(newPassword);
    await this.authRepository.updateUserPassword(tokenRecord.userId, hashed);
    await this.authRepository.markPasswordResetTokenUsed(token);
    return { message: 'Senha redefinida com sucesso.' };
  }
}

module.exports = ResetPasswordUseCase;