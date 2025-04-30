import AuthRepository from '../../domain/repositories/AuthRepository';
import VerificationTokenService from '../../infrastructure/services/VerificationTokenService';
/**
 * Use case for initiating a password reset.
 */
class ForgotPasswordUseCase {
  private authRepository: AuthRepository;
  private tokenService: VerificationTokenService;

  constructor({ authRepository, tokenService }: { authRepository: AuthRepository; tokenService: VerificationTokenService }) {
    this.authRepository = authRepository;
    this.tokenService = tokenService;
  }

  /**
   * Execute forgot password process.
   * @param {object} params
   * @param {string} params.email
   * @returns {Promise<{verificationToken: string}>}
   */
  async execute({ email }: { email: string }): Promise<{ verificationToken: string }> {
    const profile = await this.authRepository.findProfileByEmail(email);
    if (!profile) {
      throw new Error('E-mail não encontrado.');
    }

    const now = Date.now();
    const cooldown = 5 * 60 * 1000; // 5 minutes
    if (profile.lastPasswordResetRequest && now - profile.lastPasswordResetRequest < cooldown) {
      const minutes = Math.ceil((cooldown - (now - profile.lastPasswordResetRequest)) / 60000);
      throw new Error(
        `Você já solicitou redefinição de senha. Tente novamente após ${minutes} minutos.`
      );
    }

    const verificationToken = this.tokenService.generate();
    await this.authRepository.updatePasswordResetRequest(profile._id, now);
    await this.authRepository.savePasswordResetToken({
      userId: profile._id,
      token: verificationToken,
      used: false,
      createdAt: now,
    });
    return { verificationToken };
  }
}

export default ForgotPasswordUseCase;