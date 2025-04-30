/**
 * Use case for a protected route.
 */
class ProtectedUseCase {
  /**
   * Execute the protected route logic.
   * @returns {{message: string}}
   */
  execute(): { message: string } {
    return { message: 'Esta é uma rota protegida' };
  }
}
export default ProtectedUseCase;