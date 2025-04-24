/**
 * Interface for quiz result repository operations.
 */
class QuizResultRepository {
  /**
   * Save a quiz result.
   * @param {object} params
   * @param {string} params.userId
   * @param {string} params.examId
   * @param {number} params.quizIndex
   * @param {number} params.correctAnswers
   * @param {number} params.totalQuestions
   * @returns {Promise<{upserted: boolean, resultId: string|null}>}
   */
  async saveQuizResult({ userId, examId, quizIndex, correctAnswers, totalQuestions }) {
    throw new Error('Method not implemented.');
  }

  /**
   * Find results by user ID.
   * @param {string} userId
   * @returns {Promise<Array<object>>}
   */
  async findResultsByUser(userId) {
    throw new Error('Method not implemented.');
  }
}

module.exports = QuizResultRepository;