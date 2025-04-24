/**
 * Use case for retrieving all quizzes of a specific exam.
 */
class GetQuizzesByExamUseCase {
  constructor({ examRepository }) {
    this.examRepository = examRepository;
  }

  /**
   * Execute retrieval of quizzes.
   * @param {object} params
   * @param {string} params.examId
   * @returns {Promise<Array<any>>}
   */
  async execute({ examId }) {
    const exam = await this.examRepository.findExamById(examId);
    if (!exam) {
      throw new Error('Exame não encontrado');
    }
    return exam.quizzes || [];
  }
}

module.exports = GetQuizzesByExamUseCase;