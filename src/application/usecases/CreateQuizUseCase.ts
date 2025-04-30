import ExamRepository from '../../domain/repositories/ExamRepository';
/**
 * Use case for adding a new quiz to an existing exam.
 */
class CreateQuizUseCase {
  private examRepository: ExamRepository;

  constructor({ examRepository }: { examRepository: ExamRepository }) {
    this.examRepository = examRepository;
  }

  /**
   * Execute the process of adding a quiz.
   * @param {object} params
   * @param {string} params.examTitle
   * @param {object} params.quiz
   * @returns {Promise<void>}
   */
  async execute({ examTitle, quiz }: { examTitle: string; quiz: any }): Promise<void> {
    const exam = await this.examRepository.findExamByTitle(examTitle);
    if (!exam) {
      throw new Error('Exame não encontrado');
    }
    const added = await this.examRepository.addQuizToExam(examTitle, quiz);
    if (!added) {
      throw new Error('Falha ao cadastrar o quiz');
    }
  }
}

export default CreateQuizUseCase;