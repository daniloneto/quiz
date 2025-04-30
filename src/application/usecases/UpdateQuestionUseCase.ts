import ExamRepository from '../../domain/repositories/ExamRepository';
/**
 * Use case for updating a question's option in a quiz within an exam.
 */
class UpdateQuestionUseCase {
  private examRepository: ExamRepository;

  constructor({ examRepository }: { examRepository: ExamRepository }) {
    this.examRepository = examRepository;
  }

  /**
   * Execute updating a question option.
   * @param {object} params
   * @param {string} params.examId
   * @param {number} params.quizIndex
   * @param {number} params.questionIndex
   * @param {number} params.optionIndex
   * @param {string} params.newValue
   * @returns {Promise<void>}
   */
  async execute({ examId, quizIndex, questionIndex, optionIndex, newValue }: { examId: string; quizIndex: number; questionIndex: number; optionIndex: number; newValue: string }): Promise<void> {
    const exam = await this.examRepository.findExamById(examId);
    if (!exam) {
      throw new Error('Exame não encontrado');
    }
    const quiz = exam.quizzes[quizIndex];
    if (!quiz || !quiz.questions || questionIndex < 0 || questionIndex >= quiz.questions.length) {
      throw new Error('Quiz ou pergunta não encontrada');
    }
    const question = quiz.questions[questionIndex];
    if (!question.options || optionIndex < 0 || optionIndex >= question.options.length) {
      throw new Error('Opção não encontrada');
    }
    question.options[optionIndex].text = newValue;
    const updated = await this.examRepository.updateQuestionInQuiz(examId, quizIndex, questionIndex, question);
    if (!updated) {
      throw new Error('Falha ao atualizar a pergunta');
    }
  }
}

export default UpdateQuestionUseCase;