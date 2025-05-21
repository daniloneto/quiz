import SaveQuizResultUseCase from '../../../../src/application/usecases/SaveQuizResultUseCase';
import MongoExamRepository from '../../../../src/infrastructure/database/MongoExamRepository';
import MongoQuizResultRepository from '../../../../src/infrastructure/database/MongoQuizResultRepository';
import { UserAnswer } from '../../../../src/domain/entities/UserAnswer';
import { IQuestionParams } from '../../../../src/domain/entities/Question';

// Mock dependencies
jest.mock('../../../../src/infrastructure/database/MongoExamRepository');
jest.mock('../../../../src/infrastructure/database/MongoQuizResultRepository');

describe('SaveQuizResultUseCase', () => {
  let saveQuizResultUseCase: SaveQuizResultUseCase;
  let mockExamRepository: jest.Mocked<MongoExamRepository>;
  let mockQuizResultRepository: jest.Mocked<MongoQuizResultRepository>;

  const userId = 'user123';
  const examId = 'exam456';
  const quizIndex = 0;

  const mockQuestions: IQuestionParams[] = [
    { id: 'q1', question: 'MCQ Question', questionType: 'multiple-choice', options: [{ text: 'Correct', correct: true }, { text: 'Wrong', correct: false }] },
    { id: 'q2', question: 'T/F Question', questionType: 'true-false', options: [{ text: 'True', correct: true }, { text: 'False', correct: false }] },
    { id: 'q3', question: 'SA Question', questionType: 'short-answer', answerKey: 'Correct Answer', options: [] },
  ];

  beforeEach(() => {
    mockExamRepository = new MongoExamRepository(null) as jest.Mocked<MongoExamRepository>;
    mockQuizResultRepository = new MongoQuizResultRepository(null) as jest.Mocked<MongoQuizResultRepository>;

    saveQuizResultUseCase = new SaveQuizResultUseCase({
      examRepository: mockExamRepository,
      quizResultRepository: mockQuizResultRepository,
    });

    // Default mock implementations
    mockExamRepository.findQuizQuestions.mockResolvedValue(mockQuestions);
    mockQuizResultRepository.saveQuizResult.mockResolvedValue({ upserted: true, resultId: 'result789' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Grading Logic', () => {
    it('Scenario 1: should correctly grade a mixed quiz with all correct answers', async () => {
      const answers: UserAnswer[] = [
        { questionId: 'q1', submittedAnswer: 'Correct' },
        { questionId: 'q2', submittedAnswer: 'True' },
        { questionId: 'q3', submittedAnswer: 'Correct Answer' },
      ];

      await saveQuizResultUseCase.execute({ userId, examId, quizIndex, answers });

      expect(mockQuizResultRepository.saveQuizResult).toHaveBeenCalledWith({
        userId,
        examId,
        quizIndex,
        correctAnswers: 3,
        totalQuestions: 3,
      });
    });

    it('Scenario 2: should correctly grade with some incorrect answers', async () => {
      const answers: UserAnswer[] = [
        { questionId: 'q1', submittedAnswer: 'Wrong' },         // Incorrect
        { questionId: 'q2', submittedAnswer: 'False' },        // Incorrect
        { questionId: 'q3', submittedAnswer: 'incorrect' },    // Incorrect
      ];

      await saveQuizResultUseCase.execute({ userId, examId, quizIndex, answers });

      expect(mockQuizResultRepository.saveQuizResult).toHaveBeenCalledWith({
        userId,
        examId,
        quizIndex,
        correctAnswers: 0,
        totalQuestions: 3,
      });
    });
    
    it('Scenario 2b: should correctly grade with some correct and some incorrect answers', async () => {
        const answers: UserAnswer[] = [
          { questionId: 'q1', submittedAnswer: 'Correct' },       // Correct
          { questionId: 'q2', submittedAnswer: 'False' },        // Incorrect
          { questionId: 'q3', submittedAnswer: 'Correct Answer' },// Correct
        ];
  
        await saveQuizResultUseCase.execute({ userId, examId, quizIndex, answers });
  
        expect(mockQuizResultRepository.saveQuizResult).toHaveBeenCalledWith({
          userId,
          examId,
          quizIndex,
          correctAnswers: 2,
          totalQuestions: 3,
        });
      });

    it('Scenario 3: should handle case-insensitive short answers correctly', async () => {
      const specificMockQuestion: IQuestionParams[] = [
        { id: 'q-sa-case', question: 'Case Test', questionType: 'short-answer', answerKey: 'CaseSensitive', options: [] },
      ];
      mockExamRepository.findQuizQuestions.mockResolvedValue(specificMockQuestion);
      const answers: UserAnswer[] = [
        { questionId: 'q-sa-case', submittedAnswer: 'casesensitive' },
      ];

      await saveQuizResultUseCase.execute({ userId, examId, quizIndex, answers });

      expect(mockQuizResultRepository.saveQuizResult).toHaveBeenCalledWith(
        expect.objectContaining({ correctAnswers: 1, totalQuestions: 1 })
      );
    });
  });

  describe('Edge Cases', () => {
    it('Scenario 4: should handle answers for non-existent questions gracefully', async () => {
      // mockQuestions (q1, q2, q3) are returned by findQuizQuestions
      const answers: UserAnswer[] = [
        { questionId: 'q1', submittedAnswer: 'Correct' },
        { questionId: 'qNonExistent', submittedAnswer: 'any' }, // This question ID is not in mockQuestions
        { questionId: 'q2', submittedAnswer: 'True' },
      ];

      await saveQuizResultUseCase.execute({ userId, examId, quizIndex, answers });

      expect(mockQuizResultRepository.saveQuizResult).toHaveBeenCalledWith({
        userId,
        examId,
        quizIndex,
        correctAnswers: 2, // Only q1 and q2 are graded
        totalQuestions: 3, // Total questions from the repository
      });
    });

    it('Scenario 5: should handle an empty answers array', async () => {
      const answers: UserAnswer[] = [];
      await saveQuizResultUseCase.execute({ userId, examId, quizIndex, answers });

      expect(mockQuizResultRepository.saveQuizResult).toHaveBeenCalledWith({
        userId,
        examId,
        quizIndex,
        correctAnswers: 0,
        totalQuestions: mockQuestions.length, // Total questions from the repository
      });
    });

    it('Scenario 6: should handle no questions found for the quiz', async () => {
      mockExamRepository.findQuizQuestions.mockResolvedValue([]); // No questions
      const answers: UserAnswer[] = [{ questionId: 'q1', submittedAnswer: 'any' }]; // User might submit something

      await saveQuizResultUseCase.execute({ userId, examId, quizIndex, answers });

      expect(mockQuizResultRepository.saveQuizResult).toHaveBeenCalledWith({
        userId,
        examId,
        quizIndex,
        correctAnswers: 0,
        totalQuestions: 0,
      });
    });
  });
  describe('Error Handling', () => {
    it('should throw an error if userId is missing', async () => {
      await expect(
        saveQuizResultUseCase.execute({ userId: undefined as any, examId, quizIndex, answers: [] })
      ).rejects.toThrow('Todos os campos são obrigatórios.');
    });

    it('should throw an error if examId is missing', async () => {
      await expect(
        saveQuizResultUseCase.execute({ userId, examId: undefined as any, quizIndex, answers: [] })
      ).rejects.toThrow('Todos os campos são obrigatórios.');
    });
    
    it('should throw an error if quizIndex is missing', async () => {
        await expect(
          saveQuizResultUseCase.execute({ userId, examId, quizIndex: undefined as any, answers: [] })
        ).rejects.toThrow('Todos os campos são obrigatórios.');
      });

    it('should throw an error if answers array is missing', async () => {
      await expect(
        saveQuizResultUseCase.execute({ userId, examId, quizIndex, answers: undefined as any })
      ).rejects.toThrow('Todos os campos são obrigatórios.');
    });

    it('should propagate error if examRepository.findQuizQuestions throws', async () => {
      const error = new Error('DB error finding questions');
      mockExamRepository.findQuizQuestions.mockRejectedValue(error);
      await expect(
        saveQuizResultUseCase.execute({ userId, examId, quizIndex, answers: [] })
      ).rejects.toThrow('DB error finding questions');
    });

    it('should propagate error if quizResultRepository.saveQuizResult throws', async () => {
      const error = new Error('DB error saving results');
      mockQuizResultRepository.saveQuizResult.mockRejectedValue(error);
      await expect(
        saveQuizResultUseCase.execute({ userId, examId, quizIndex, answers: [{questionId: 'q1', submittedAnswer: 'ans'}] })
      ).rejects.toThrow('DB error saving results');
    });
  });
});
