import AuthRepository from '../../domain/repositories/AuthRepository';
import Argon2PasswordService from '../../infrastructure/services/Argon2PasswordService';
/**
 * Use case for resetting a user's password.
 */
class ResetPasswordUseCase {
  private authRepository: AuthRepository;
  private passwordService: Argon2PasswordService;

  constructor({ authRepository, passwordService }: { authRepository: AuthRepository; passwordService: Argon2PasswordService }) {
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
  async execute({ token, newPassword }: { token: string; newPassword: string }): Promise<{ message: string }> {
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

export default ResetPasswordUseCase;