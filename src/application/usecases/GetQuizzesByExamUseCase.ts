import ExamRepository from '../../domain/repositories/ExamRepository';
/**
 * Use case for retrieving all quizzes of a specific exam.
 */
class GetQuizzesByExamUseCase {
  private examRepository: ExamRepository;

  constructor({ examRepository }: { examRepository: ExamRepository }) {
    this.examRepository = examRepository;
  }

  /**
   * Execute retrieval of quizzes.
   * @param {object} params
   * @param {string} params.examId
   * @returns {Promise<Array<any>>}
   */
  async execute({ examId }: { examId: string }): Promise<any[]> {
    const exam = await this.examRepository.findExamById(examId);
    if (!exam) {
      throw new Error('Exame não encontrado');
    }
    return exam.quizzes || [];
  }
}

export default GetQuizzesByExamUseCase;