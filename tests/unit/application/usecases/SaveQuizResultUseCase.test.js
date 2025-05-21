import SaveQuizResultUseCase from '../../../../src/application/usecases/SaveQuizResultUseCase';

describe('SaveQuizResultUseCase', () => {
  let useCase;
  let mockQuizResultRepository;
  let mockExamRepository;
  
  beforeEach(() => {
    mockQuizResultRepository = {
      saveQuizResult: jest.fn()
    };
    
    mockExamRepository = {
      findQuizQuestions: jest.fn()
    };
    
    useCase = new SaveQuizResultUseCase({
      quizResultRepository: mockQuizResultRepository,
      examRepository: mockExamRepository
    });
  });
  
  test('should throw error when required fields are missing', async () => {
    // Arrange
    const incompleteParams = {
      userId: '123',
      // Missing examId and other required fields
    };
    
    // Act & Assert
    await expect(useCase.execute(incompleteParams))
      .rejects
      .toThrow('Todos os campos são obrigatórios.');
  });  test('should save quiz result successfully', async () => {
    // Arrange
    const params = {
      userId: '123',
      examId: '456',
      quizIndex: 0,
      answers: [], // Empty answers array
    };
    
    const expectedResult = {
      upserted: true,
      resultId: '789'
    };
    
    // Mock the findQuizQuestions to return questions
    // We're returning an empty array which will lead to 0 correctAnswers and 0 totalQuestions
    mockExamRepository.findQuizQuestions.mockResolvedValue([]);
    mockQuizResultRepository.saveQuizResult.mockResolvedValue(expectedResult);
    
    // Act
    const result = await useCase.execute(params);
    
    // Assert
    // Since findQuizQuestions returns empty array, the saveQuizResult will be called with
    // correctAnswers: 0 and totalQuestions: 0
    expect(mockQuizResultRepository.saveQuizResult).toHaveBeenCalledWith({
      userId: '123',
      examId: '456',
      quizIndex: 0,
      correctAnswers: 0,
      totalQuestions: 0,
    });
    expect(result).toEqual(expectedResult);
  });
});
