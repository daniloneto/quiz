import AuthRepository from '../../domain/repositories/AuthRepository';
import Argon2PasswordService from '../../infrastructure/services/Argon2PasswordService';
import JwtService from '../../infrastructure/services/JwtService';
/**
 * Use case for logging in a user.
 */
class LoginUserUseCase {
  private authRepository: AuthRepository;
  private passwordService: Argon2PasswordService;
  private jwtService: JwtService;

  constructor({ authRepository, passwordService, jwtService }: { authRepository: AuthRepository; passwordService: Argon2PasswordService; jwtService: JwtService }) {
    this.authRepository = authRepository;
    this.passwordService = passwordService;
    this.jwtService = jwtService;
  }

  /**
   * Execute the login process.
   * @param {object} params
   * @param {string} params.username
   * @param {string} params.password
   * @param {string} params.loginType
   * @returns {Promise<{token: string, expiresAt: Date, uid: string}>}
   */
  async execute({ username, password, loginType }: { username: string; password: string; loginType: string }): Promise<{ token: string; expiresAt: Date; uid: string }> {
    const user = await this.authRepository.findUserByUsername(username);
    if (!user) {
      throw new Error('Usuário e/ou senha incorreta.');
    }

    const profile = await this.authRepository.findProfileById(user._id);
    if (!profile.ativado) {
      throw new Error('Conta não foi ativada ainda, verifique seu e-mail.');
    }

    if (loginType === 'admin' && profile.adm === false) {
      throw new Error('Você não tem permissão suficiente.');
    }

    const isValid = await this.passwordService.verify(user.password, password);
    if (!isValid) {
      throw new Error('Usuário e/ou senha incorreta.');
    }

    await this.authRepository.updateLastLogin(user._id, new Date());

    const token = this.jwtService.sign({ userId: user._id.toString() }, { expiresIn: '1h' });
    const expiresAt = new Date(Date.now() + 3600000);
    return { token, expiresAt, uid: user._id.toString() };
  }
}

export default LoginUserUseCase;