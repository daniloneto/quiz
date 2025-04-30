/**
 * Service for generating simple verification tokens.
 */
class VerificationTokenService {
  private length: number;
  private characters: string;

  constructor(length = 5) {
    this.length = length;
    this.characters = 'BCDFGHJKLMNPQRSTVWXYZ0123456789';
  }

  /**
   * Generate a random verification token.
   * @returns {string}
   */
  generate() {
    let token = '';
    for (let i = 0; i < this.length; i++) {
      token += this.characters.charAt(
        Math.floor(Math.random() * this.characters.length)
      );
    }
    return token;
  }
}

export default VerificationTokenService;