const MongoQuizResultRepository = require('../../../../src/infrastructure/database/MongoQuizResultRepository');
const { ObjectId } = require('mongodb');

// Mock ObjectId to avoid requiring MongoDB in tests
jest.mock('mongodb', () => ({
  ObjectId: jest.fn(id => ({ toString: () => id }))
}));

describe('MongoQuizResultRepository', () => {
  let repository;
  let mockCollection;
  let mockDb;
  
  // Mock date for consistent testing
  const mockDate = new Date('2025-04-24T11:39:37.696Z');
  
  beforeEach(() => {
    // Setup date mock
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    
    // Reset mocks
    mockCollection = {
      updateOne: jest.fn(),
      find: jest.fn(),
    };

    // Mock find chain
    mockCollection.find.mockReturnValue({
      toArray: jest.fn()
    });

    // Mock database
    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection)
    };

    repository = new MongoQuizResultRepository(mockDb);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('constructor initializes correctly', () => {
    expect(repository.db).toBe(mockDb);
    expect(repository.collection).toBe(mockCollection);
    expect(mockDb.collection).toHaveBeenCalledWith('quizResults');
  });

  describe('saveQuizResult', () => {
    test('should save quiz result with upsert when record is created', async () => {
      const params = {
        userId: '123',
        examId: '456',
        quizIndex: 0,
        correctAnswers: 8,
        totalQuestions: 10
      };

      mockCollection.updateOne.mockResolvedValue({
        upsertedCount: 1,
        upsertedId: { _id: new ObjectId('789') }
      });

      const result = await repository.saveQuizResult(params);

      expect(result).toEqual({
        upserted: true,
        resultId: '789'
      });
    });

    test('should save quiz result with upsert when updating existing record', async () => {
      const params = {
        userId: '123',
        examId: '456',
        quizIndex: 1,
        correctAnswers: 5,
        totalQuestions: 10
      };

      mockCollection.updateOne.mockResolvedValue({
        upsertedCount: 0
      });

      const result = await repository.saveQuizResult(params);      

      expect(result).toEqual({
        upserted: false,
        resultId: null
      });
    });
  });

  describe('findResultsByUser', () => {
    test('should retrieve and format quiz results for a user', async () => {
      const userId = '123';
      const mockResults = [
        {
          _id: new ObjectId('result1'),
          userId: new ObjectId('123'),
          examId: new ObjectId('456'),
          quizzes: [
            {
              quizIndex: 0,
              answers: [{ correctAnswers: 8, totalQuestions: 10, date: new Date() }]
            }
          ]
        }
      ];

      mockCollection.find().toArray.mockResolvedValue(mockResults);

      const results = await repository.findResultsByUser(userId);

      expect(mockCollection.find().toArray).toHaveBeenCalled();
      
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        userId: '123',
        examId: '456',
        quizzes: mockResults[0].quizzes
      });
    });
  });
});
