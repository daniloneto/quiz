import ExamRepository from '../../domain/repositories/ExamRepository';
/**
 * Use case for adding a question to a quiz within an exam.
 */
class AddQuestionUseCase {
  private examRepository: ExamRepository;

  constructor({ examRepository }: { examRepository: ExamRepository }) {
    this.examRepository = examRepository;
  }

  /**
   * Execute adding a question.
   * @param {object} params
   * @param {string} params.examTitle
   * @param {string} params.quizTitle
   * @param {object} params.questionEntity
   * @returns {Promise<void>}
   */
  async execute({ examTitle, quizTitle, questionEntity }: { examTitle: string; quizTitle: string; questionEntity: any }): Promise<void> {
    const added = await this.examRepository.addQuestionToQuiz(examTitle, quizTitle, questionEntity);
    if (!added) {
      throw new Error('Falha ao adicionar a pergunta.');
    }
  }
}

export default AddQuestionUseCase;