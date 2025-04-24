import GetQuizResultsUseCase from '../../../../src/application/usecases/GetQuizResultsUseCase';

describe('GetQuizResultsUseCase', () => {
  let useCase;
  let mockQuizResultRepository;
  let mockExamRepository;

  beforeEach(() => {
    mockQuizResultRepository = {
      findResultsByUser: jest.fn()
    };

    mockExamRepository = {
      findExamById: jest.fn()
    };

    useCase = new GetQuizResultsUseCase({
      quizResultRepository: mockQuizResultRepository,
      examRepository: mockExamRepository
    });
  });

  test('should throw error when userId is not provided', async () => {
    await expect(useCase.execute({})).rejects.toThrow('userId é obrigatório');
  });

  test('should throw error when no results are found', async () => {
    const userId = '123';
    mockQuizResultRepository.findResultsByUser.mockResolvedValue([]);

    await expect(useCase.execute({ userId })).rejects.toThrow('Nenhum resultado encontrado para este usuário.');
  });

  test('should throw error when results are null', async () => {
    const userId = '123';
    mockQuizResultRepository.findResultsByUser.mockResolvedValue(null);

    await expect(useCase.execute({ userId })).rejects.toThrow('Nenhum resultado encontrado para este usuário.');
  });

  test('should return enriched results with exam titles', async () => {
    const userId = '123';
    const mockResults = [
      {
        userId: '123',
        examId: '456',
        quizzes: [
          {
            quizIndex: 0,
            answers: [{ correctAnswers: 8, totalQuestions: 10, date: new Date() }]
          }
        ]
      },
      {
        userId: '123',
        examId: '789',
        quizzes: [
          {
            quizIndex: 1,
            answers: [{ correctAnswers: 5, totalQuestions: 10, date: new Date() }]
          }
        ]
      }
    ];

    const mockExams = [
      { id: '456', title: 'Exam 1' },
      { id: '789', title: 'Exam 2' }
    ];

    mockQuizResultRepository.findResultsByUser.mockResolvedValue(mockResults);
    
    // Set up the mockExamRepository to return different exams based on id
    mockExamRepository.findExamById.mockImplementation((id) => {
      return Promise.resolve(mockExams.find(exam => exam.id === id));
    });

    const results = await useCase.execute({ userId });

    expect(mockQuizResultRepository.findResultsByUser).toHaveBeenCalledWith(userId);
  });
});