const UpdateQuestionUseCase = require('../../../../src/application/usecases/UpdateQuestionUseCase');

describe('UpdateQuestionUseCase', () => {
  let useCase;
  let mockExamRepository;
  
  beforeEach(() => {
    mockExamRepository = {
      findExamById: jest.fn(),
      updateQuestionInQuiz: jest.fn()
    };
    
    useCase = new UpdateQuestionUseCase({
      examRepository: mockExamRepository
    });
  });
  
  test('should throw error when exam is not found', async () => {
    // Arrange
    const params = {
      examId: '123',
      quizIndex: 0,
      questionIndex: 1,
      optionIndex: 0,
      newValue: 'Updated option'
    };
    
    mockExamRepository.findExamById.mockResolvedValue(null);
    
    // Act & Assert
    await expect(useCase.execute(params))
      .rejects
      .toThrow('Exame não encontrado');
  });
  
  test('should throw error when quiz or question is not found', async () => {
    // Arrange
    const params = {
      examId: '123',
      quizIndex: 0,
      questionIndex: 1,
      optionIndex: 0,
      newValue: 'Updated option'
    };
    
    const mockExam = {
      id: '123',
      quizzes: []
    };
    
    mockExamRepository.findExamById.mockResolvedValue(mockExam);
    
    // Act & Assert
    await expect(useCase.execute(params))
      .rejects
      .toThrow('Quiz ou pergunta não encontrada');
  });
  
  test('should throw error when option is not found', async () => {
    // Arrange
    const params = {
      examId: '123',
      quizIndex: 0,
      questionIndex: 0,
      optionIndex: 2,
      newValue: 'Updated option'
    };
    
    const mockExam = {
      id: '123',
      quizzes: [{
        questions: [{
          text: 'Question',
          options: [{ text: 'Option 1' }]
        }]
      }]
    };
    
    mockExamRepository.findExamById.mockResolvedValue(mockExam);
    
    // Act & Assert
    await expect(useCase.execute(params))
      .rejects
      .toThrow('Opção não encontrada');
  });
  
  test('should update question option successfully', async () => {
    // Arrange
    const params = {
      examId: '123',
      quizIndex: 0,
      questionIndex: 0,
      optionIndex: 0,
      newValue: 'Updated option'
    };
    
    const mockExam = {
      id: '123',
      quizzes: [{
        questions: [{
          text: 'Question',
          options: [{ text: 'Option 1' }]
        }]
      }]
    };
    
    mockExamRepository.findExamById.mockResolvedValue(mockExam);
    mockExamRepository.updateQuestionInQuiz.mockResolvedValue(true);
    
    // Act
    await useCase.execute(params);
    
    // Assert
    expect(mockExamRepository.findExamById).toHaveBeenCalledWith(params.examId);
    expect(mockExamRepository.updateQuestionInQuiz).toHaveBeenCalledWith(
      params.examId,
      params.quizIndex,
      params.questionIndex,
      expect.objectContaining({
        options: [{ text: params.newValue }]
      })
    );
  });
  
  test('should throw error when update fails', async () => {
    // Arrange
    const params = {
      examId: '123',
      quizIndex: 0,
      questionIndex: 0,
      optionIndex: 0,
      newValue: 'Updated option'
    };
    
    const mockExam = {
      id: '123',
      quizzes: [{
        questions: [{
          text: 'Question',
          options: [{ text: 'Option 1' }]
        }]
      }]
    };
    
    mockExamRepository.findExamById.mockResolvedValue(mockExam);
    mockExamRepository.updateQuestionInQuiz.mockResolvedValue(false);
    
    // Act & Assert
    await expect(useCase.execute(params))
      .rejects
      .toThrow('Falha ao atualizar a pergunta');
  });
});
