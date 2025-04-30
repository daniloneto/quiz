import QuizResultRepository from '../../domain/repositories/QuizResultRepository';
/**
 * Use case for saving or updating a quiz result.
 */
class SaveQuizResultUseCase {
  private quizResultRepository: QuizResultRepository;

  constructor({ quizResultRepository }: { quizResultRepository: QuizResultRepository }) {
    this.quizResultRepository = quizResultRepository;
  }

  /**
   * Execute the save or update of a quiz result.
   * @param {object} params
   * @param {string} params.userId
   * @param {string} params.examId
   * @param {number} params.quizIndex
   * @param {number} params.correctAnswers
   * @param {number} params.totalQuestions
   * @returns {Promise<{upserted: boolean, resultId: string|null}>}
   */
  async execute({ userId, examId, quizIndex, correctAnswers, totalQuestions }: { userId: string; examId: string; quizIndex: number; correctAnswers: number; totalQuestions: number }): Promise<{ upserted: boolean; resultId: string | null }> {
    if (!userId || !examId || quizIndex === undefined || correctAnswers === undefined || totalQuestions === undefined) {
      throw new Error('Todos os campos são obrigatórios.');
    }
    const result = await this.quizResultRepository.saveQuizResult({ userId, examId, quizIndex, correctAnswers, totalQuestions });
    return result;
  }
}

export default SaveQuizResultUseCase;