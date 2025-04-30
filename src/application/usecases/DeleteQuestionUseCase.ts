import ExamRepository from '../../domain/repositories/ExamRepository';
/**
 * Use case for deleting a question from a quiz within an exam.
 */
class DeleteQuestionUseCase {
  private examRepository: ExamRepository;

  constructor({ examRepository }: { examRepository: ExamRepository }) {
    this.examRepository = examRepository;
  }

  /**
   * Execute deleting a question.
   * @param {object} params
   * @param {string} params.examId
   * @param {number} params.quizIndex
   * @param {number} params.questionIndex
   * @returns {Promise<void>}
   */
  async execute({ examId, quizIndex, questionIndex }: { examId: string; quizIndex: number; questionIndex: number }): Promise<void> {
    const deleted = await this.examRepository.deleteQuestionFromQuiz(examId, quizIndex, questionIndex);
    if (!deleted) {
      throw new Error('Falha ao deletar a pergunta');
    }
  }
}

export default DeleteQuestionUseCase;