import SaveQuizResultUseCase from '../../../../src/application/usecases/SaveQuizResultUseCase';

describe('SaveQuizResultUseCase', () => {
  let useCase;
  let mockQuizResultRepository;
  
  beforeEach(() => {
    mockQuizResultRepository = {
      saveQuizResult: jest.fn()
    };
    
    useCase = new SaveQuizResultUseCase({
      quizResultRepository: mockQuizResultRepository
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
  });
  
  test('should save quiz result successfully', async () => {
    // Arrange
    const params = {
      userId: '123',
      examId: '456',
      quizIndex: 0,
      correctAnswers: 8,
      totalQuestions: 10
    };
    
    const expectedResult = {
      upserted: true,
      resultId: '789'
    };
    
    mockQuizResultRepository.saveQuizResult.mockResolvedValue(expectedResult);
    
    // Act
    const result = await useCase.execute(params);
    
    // Assert
    expect(mockQuizResultRepository.saveQuizResult).toHaveBeenCalledWith(params);
    expect(result).toEqual(expectedResult);
  });
});
