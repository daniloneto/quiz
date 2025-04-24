const User = require('../../domain/entities/User');
const Profile = require('../../domain/entities/Profile');

/**
 * Use case for registering a new user.
 */
class RegisterUserUseCase {
  constructor({ authRepository, passwordService, tokenService }) {
    this.authRepository = authRepository;
    this.passwordService = passwordService;
    this.tokenService = tokenService;
  }

  /**
   * Execute the registration process.
   * @param {object} params
   * @param {string} params.username
   * @param {string} params.password
   * @param {string} params.name
   * @param {string} params.email
   * @returns {Promise<{verificationToken: string}>}
   */
  async execute({ username, password, name, email }) {
    const existingUser = await this.authRepository.findUserByUsername(username);
    if (existingUser) {
      throw new Error('Nome de usuário já em uso.');
    }

    const existingProfile = await this.authRepository.findProfileByEmail(email);
    if (existingProfile) {
      throw new Error('E-mail em uso.');
    }

    const passwordHash = await this.passwordService.hash(password);
    const userEntity = new User({ username, passwordHash });
    const userId = await this.authRepository.saveUser(userEntity);

    const verificationToken = this.tokenService.generate();
    const profileEntity = new Profile({ id: userId, name, email, token: verificationToken });
    await this.authRepository.saveProfile(profileEntity);

    return { verificationToken };
  }
}

module.exports = RegisterUserUseCase;