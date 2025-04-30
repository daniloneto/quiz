import ExamRepository from '../../domain/repositories/ExamRepository';
/**
 * Use case to retrieve a specific quiz by exam title and index.
 */
class GetQuizByIndexUseCase {
  private examRepository: ExamRepository;

  constructor({ examRepository }: { examRepository: ExamRepository }) {
    this.examRepository = examRepository;
  }

  /**
   * Execute retrieval of quiz.
   * @param {object} params
   * @param {string} params.title
   * @param {number} params.index
   * @returns {Promise<any>} The quiz object
   */
  async execute({ title, index }: { title: string; index: number }): Promise<any> {
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

export default GetQuizByIndexUseCase;