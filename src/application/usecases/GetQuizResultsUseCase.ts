import QuizResultRepository from '../../domain/repositories/QuizResultRepository';
import ExamRepository from '../../domain/repositories/ExamRepository';
/**
 * Use case for retrieving quiz results of a user, enriched with exam title.
 */
class GetQuizResultsUseCase {
  private quizResultRepository: QuizResultRepository;
  private examRepository: ExamRepository;

  constructor({ quizResultRepository, examRepository }: { quizResultRepository: QuizResultRepository; examRepository: ExamRepository }) {
    this.quizResultRepository = quizResultRepository;
    this.examRepository = examRepository;
  }

  /**
   * Execute retrieval of quiz results for a user.
   * @param {object} params
   * @param {string} params.userId
   * @returns {Promise<Array<object>>}
   */
  async execute({ userId }: { userId?: string }): Promise<any[]> {
    if (!userId) {
      throw new Error('userId é obrigatório');
    }
    const results = await this.quizResultRepository.findResultsByUser(userId);
    if (!results || results.length === 0) {
      throw new Error('Nenhum resultado encontrado para este usuário.');
    }
    const enriched = await Promise.all(
      results.map(async (r) => {
        const exam = await this.examRepository.findExamById(r.examId);
        return {
          ...r,
          examTitle: exam ? exam.title : null
        };
      })
    );
    return enriched;
  }
}

export default GetQuizResultsUseCase;