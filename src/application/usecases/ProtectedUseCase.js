/**
 * Use case for a protected route.
 */
class ProtectedUseCase {
  /**
   * Execute the protected route logic.
   * @returns {{message: string}}
   */
  execute() {
    return { message: 'Esta é uma rota protegida' };
  }
}

module.exports = ProtectedUseCase;