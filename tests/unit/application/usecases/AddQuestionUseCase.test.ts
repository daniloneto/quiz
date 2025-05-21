import AddQuestionUseCase from '../../../../src/application/usecases/AddQuestionUseCase';
import { QuestionGenerationService } from '../../../../src/domain/services/QuestionGenerationService';
import MongoExamRepository from '../../../../src/infrastructure/database/MongoExamRepository';
import { IQuestionParams, QuestionType } from '../../../../src/domain/entities/Question';
import { IOptionParams } from '../../../../src/domain/entities/Option';

// Mock dependencies
jest.mock('../../../../src/domain/services/QuestionGenerationService');
jest.mock('../../../../src/infrastructure/database/MongoExamRepository');

describe('AddQuestionUseCase', () => {
  let addQuestionUseCase: AddQuestionUseCase;
  let mockQuestionGenerationService: jest.Mocked<QuestionGenerationService>;
  let mockExamRepository: jest.Mocked<MongoExamRepository>;

  const examTitle = 'Sample Exam';
  const quizTitle = 'Sample Quiz';

  beforeEach(() => {
    // Create new instances of mocks for each test
    mockQuestionGenerationService = new QuestionGenerationService() as jest.Mocked<QuestionGenerationService>;
    mockExamRepository = new MongoExamRepository(null) as jest.Mocked<MongoExamRepository>; // null for db as it's mocked

    addQuestionUseCase = new AddQuestionUseCase({
      examRepository: mockExamRepository,
      questionGenerationService: mockQuestionGenerationService,
    });

    // Default mock for addQuestionToQuiz to return true (success)
    mockExamRepository.addQuestionToQuiz.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('AI Generation Path', () => {
    const topic = 'AI Topic';
    const context = 'AI Context';

    it('should call generateMultipleChoiceQuestion and add to quiz', async () => {
      const questionType: QuestionType = 'multiple-choice';
      const numChoices = 4;
      const generatedQuestion: IQuestionParams = {
        id: 'gen-mcq-1',
        question: 'Generated MCQ',
        options: [{ text: 'A', correct: true }, { text: 'B', correct: false }],
        questionType,
      };
      mockQuestionGenerationService.generateMultipleChoiceQuestion.mockResolvedValue(generatedQuestion);

      await addQuestionUseCase.execute({ examTitle, quizTitle, questionType, topic, context, numChoices });

      expect(mockQuestionGenerationService.generateMultipleChoiceQuestion).toHaveBeenCalledWith(topic, context, undefined, numChoices);
      expect(mockExamRepository.addQuestionToQuiz).toHaveBeenCalledWith(examTitle, quizTitle, generatedQuestion);
    });

    it('should call generateTrueFalseQuestion and add to quiz', async () => {
      const questionType: QuestionType = 'true-false';
      const generatedQuestion: IQuestionParams = {
        id: 'gen-tf-1',
        question: 'Generated T/F',
        options: [{ text: 'True', correct: true }, { text: 'False', correct: false }],
        questionType,
      };
      mockQuestionGenerationService.generateTrueFalseQuestion.mockResolvedValue(generatedQuestion);

      await addQuestionUseCase.execute({ examTitle, quizTitle, questionType, topic, context });

      expect(mockQuestionGenerationService.generateTrueFalseQuestion).toHaveBeenCalledWith(topic, context);
      expect(mockExamRepository.addQuestionToQuiz).toHaveBeenCalledWith(examTitle, quizTitle, generatedQuestion);
    });

    it('should call generateShortAnswerQuestion and add to quiz', async () => {
      const questionType: QuestionType = 'short-answer';
      const generatedQuestion: IQuestionParams = {
        id: 'gen-sa-1',
        question: 'Generated SA',
        options: [],
        questionType,
        answerKey: 'Answer',
      };
      mockQuestionGenerationService.generateShortAnswerQuestion.mockResolvedValue(generatedQuestion);

      await addQuestionUseCase.execute({ examTitle, quizTitle, questionType, topic, context });

      expect(mockQuestionGenerationService.generateShortAnswerQuestion).toHaveBeenCalledWith(topic, context);
      expect(mockExamRepository.addQuestionToQuiz).toHaveBeenCalledWith(examTitle, quizTitle, generatedQuestion);
    });
  });

  describe('Direct Input Path', () => {
    const questionText = 'Direct Question Text';

    it('should handle direct multiple-choice question', async () => {
      const questionType: QuestionType = 'multiple-choice';
      const options: IOptionParams[] = [
        { text: 'Option A', correct: false },
        { text: 'Option B', correct: false },
        { text: 'Correct Option C', correct: false }, // Correctness will be set by use case
      ];
      const correctAnswer = 'Correct Option C';

      await addQuestionUseCase.execute({ examTitle, quizTitle, questionType, questionText, options, correctAnswer });

      expect(mockExamRepository.addQuestionToQuiz).toHaveBeenCalledWith(
        examTitle,
        quizTitle,
        expect.objectContaining({
          question: questionText,
          questionType,
          options: expect.arrayContaining([
            expect.objectContaining({ text: 'Option A', correct: false }),
            expect.objectContaining({ text: 'Option B', correct: false }),
            expect.objectContaining({ text: 'Correct Option C', correct: true }),
          ]),
        })
      );
    });

    it('should handle direct true-false question', async () => {
      const questionType: QuestionType = 'true-false';
      const correctAnswer = 'True';

      await addQuestionUseCase.execute({ examTitle, quizTitle, questionType, questionText, correctAnswer });

      expect(mockExamRepository.addQuestionToQuiz).toHaveBeenCalledWith(
        examTitle,
        quizTitle,
        expect.objectContaining({
          question: questionText,
          questionType,
          options: [
            { text: 'True', correct: true },
            { text: 'False', correct: false },
          ],
        })
      );
    });
    
    it('should handle direct true-false question with False as correct answer', async () => {
        const questionType: QuestionType = 'true-false';
        const correctAnswer = 'False';
  
        await addQuestionUseCase.execute({ examTitle, quizTitle, questionType, questionText, correctAnswer });
  
        expect(mockExamRepository.addQuestionToQuiz).toHaveBeenCalledWith(
          examTitle,
          quizTitle,
          expect.objectContaining({
            question: questionText,
            questionType,
            options: [
              { text: 'True', correct: false },
              { text: 'False', correct: true },
            ],
          })
        );
      });

    it('should handle direct short-answer question', async () => {
      const questionType: QuestionType = 'short-answer';
      const correctAnswer = 'Direct Answer Key';

      await addQuestionUseCase.execute({ examTitle, quizTitle, questionType, questionText, correctAnswer });

      expect(mockExamRepository.addQuestionToQuiz).toHaveBeenCalledWith(
        examTitle,
        quizTitle,
        expect.objectContaining({
          question: questionText,
          questionType,
          options: [],
          answerKey: correctAnswer,
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should throw an error if examRepository.addQuestionToQuiz returns false', async () => {
      mockExamRepository.addQuestionToQuiz.mockResolvedValue(false);
      const questionType: QuestionType = 'multiple-choice';
      const questionText = 'Test Question';
      const options: IOptionParams[] = [{ text: 'A', correct: true }];

      await expect(
        addQuestionUseCase.execute({ examTitle, quizTitle, questionType, questionText, options, correctAnswer: 'A' })
      ).rejects.toThrow('Failed to add the question to the quiz.');
    });

    it('should throw error for AI generation if topic is missing', async () => {
        const questionType: QuestionType = 'multiple-choice';
        await expect(
          addQuestionUseCase.execute({ examTitle, quizTitle, questionType, context: 'context only' })
        ).rejects.toThrow('Invalid parameters: Provide topic and context for AI generation, or questionText for direct input.');
      });
  
      it('should throw error for direct input if questionText is missing', async () => {
        const questionType: QuestionType = 'multiple-choice';
        await expect(
          addQuestionUseCase.execute({ examTitle, quizTitle, questionType, options: [] })
        ).rejects.toThrow('Invalid parameters: Provide topic and context for AI generation, or questionText for direct input.');
      });

      it('should throw error for direct multiple-choice if options are missing', async () => {
        const questionType: QuestionType = 'multiple-choice';
        await expect(
          addQuestionUseCase.execute({ examTitle, quizTitle, questionType, questionText: 'text' })
        ).rejects.toThrow('Options are required for multiple-choice questions when providing question text directly.');
      });
  
      it('should throw error for direct true-false if correctAnswer is missing', async () => {
        const questionType: QuestionType = 'true-false';
        await expect(
          addQuestionUseCase.execute({ examTitle, quizTitle, questionType, questionText: 'text' })
        ).rejects.toThrow('Correct answer is required for true-false or short-answer questions when providing question text directly.');
      });

      it('should throw error for direct multiple-choice if correctAnswer does not match any option', async () => {
        const questionType: QuestionType = 'multiple-choice';
        const options: IOptionParams[] = [{ text: 'Option A' }];
        await expect(
          addQuestionUseCase.execute({ examTitle, quizTitle, questionType, questionText: 'text', options, correctAnswer: 'NonExistent' })
        ).rejects.toThrow('The provided correctAnswer text does not match any of the provided options for multiple-choice question.');
      });
  });
});
