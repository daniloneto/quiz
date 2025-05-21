import QuizResultRepository from '../../domain/repositories/QuizResultRepository';
import ExamRepository from '../../domain/repositories/ExamRepository';
import { UserAnswer } from '../../domain/entities/UserAnswer';
import { IQuestionParams } from '../../domain/entities/Question';

interface SaveQuizResultUseCaseConstructorParams {
  quizResultRepository: QuizResultRepository;
  examRepository: ExamRepository;
}

interface SaveQuizResultUseCaseExecuteParams {
  userId: string;
  examId: string;
  quizIndex: number;
  answers: UserAnswer[];
}

/**
 * Use case for saving or updating a quiz result with server-side grading.
 */
class SaveQuizResultUseCase {
  private quizResultRepository: QuizResultRepository;
  private examRepository: ExamRepository;

  constructor({ quizResultRepository, examRepository }: SaveQuizResultUseCaseConstructorParams) {
    this.quizResultRepository = quizResultRepository;
    this.examRepository = examRepository;
  }

  /**
   * Execute the save or update of a quiz result.
   */  async execute({ userId, examId, quizIndex, answers }: SaveQuizResultUseCaseExecuteParams): Promise<{ upserted: boolean; resultId: string | null }> {
    if (!userId || !examId || quizIndex === undefined || !answers) {
      throw new Error('Todos os campos são obrigatórios.');
    }

    const questions: IQuestionParams[] = await this.examRepository.findQuizQuestions(examId, quizIndex);
    if (!questions || questions.length === 0) {
      // Or handle as an error if questions are expected
      console.warn(`No questions found for examId: ${examId}, quizIndex: ${quizIndex}. Saving result with 0 score.`);
      const result = await this.quizResultRepository.saveQuizResult({
        userId,
        examId,
        quizIndex,
        correctAnswers: 0,
        totalQuestions: 0,
      });
      return result;
    }
    
    let calculatedCorrectAnswers = 0;
    const calculatedTotalQuestions = questions.length;

    for (const userAnswer of answers) {
      const question = questions.find(q => q.id === userAnswer.questionId);
      if (!question) {
        console.warn(`Question with id ${userAnswer.questionId} not found in quiz. Skipping.`);
        continue;
      }

      let isCorrect = false;
      switch (question.questionType) {
        case 'multiple-choice':
        case 'true-false':
          const chosenOption = question.options.find(opt => opt.text === userAnswer.submittedAnswer);
          if (chosenOption && chosenOption.correct) {
            isCorrect = true;
          }
          break;
        case 'short-answer':
          if (question.answerKey && userAnswer.submittedAnswer.toLowerCase() === question.answerKey.toLowerCase()) {
            isCorrect = true;
          }
          break;
        default:
          console.warn(`Unknown question type: ${question.questionType}`);
          break;
      }

      if (isCorrect) {
        calculatedCorrectAnswers++;
      }
    }

    const result = await this.quizResultRepository.saveQuizResult({
      userId,
      examId,
      quizIndex,
      correctAnswers: calculatedCorrectAnswers,
      totalQuestions: calculatedTotalQuestions,
    });
    return result;
  }
}

export default SaveQuizResultUseCase;