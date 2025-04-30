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
/** Parameters for saving a quiz result. */
export interface IQuizResultParams {
  userId: string;
  examId: string;
  quizIndex: number;
  correctAnswers: number;
  totalQuestions: number;
}

/** Result of saving a quiz result. */
export interface ISaveQuizResultResult {
  upserted: boolean;
  resultId: string | null;
}

/**
 * Abstract repository for quiz result operations.
 */
export default class QuizResultRepository {
  /**
   * Save a quiz result.
   */
  async saveQuizResult(params: IQuizResultParams): Promise<ISaveQuizResultResult> {
    throw new Error('Method not implemented.');
  }

  /**
   * Find results by user ID.
   * @param {string} userId
   * @returns {Promise<Array<object>>}
   */
  /**
   * Find results by user ID.
   */
  async findResultsByUser(userId: string): Promise<any[]> {
    throw new Error('Method not implemented.');
  }
}