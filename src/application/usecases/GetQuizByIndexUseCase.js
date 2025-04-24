/**
 * Use case to retrieve a specific quiz by exam title and index.
 */
class GetQuizByIndexUseCase {
  constructor({ examRepository }) {
    this.examRepository = examRepository;
  }

  /**
   * Execute retrieval of quiz.
   * @param {object} params
   * @param {string} params.title
   * @param {number} params.index
   * @returns {Promise<any>} The quiz object
   */
  async execute({ title, index }) {
    const exam = await this.examRepository.findExamByTitle(title);
    if (!exam) {
      throw new Error('Prova não encontrada');
    }
    if (!Array.isArray(exam.quizzes) || index < 0 || index >= exam.quizzes.length) {
      throw new Error('Quiz não encontrado');
    }
    return exam.quizzes[index];
  }
}

module.exports = GetQuizByIndexUseCase;