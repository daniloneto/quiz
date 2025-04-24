const MongoExamRepository = require('../../../../src/infrastructure/database/MongoExamRepository');
const { ObjectId } = require('mongodb');

// Mock ObjectId to avoid requiring MongoDB in tests
jest.mock('mongodb', () => ({
  ObjectId: jest.fn(id => ({ toString: () => id }))
}));

describe('MongoExamRepository', () => {
  let repository;
  let mockCollection;
  let mockDb;

  beforeEach(() => {
    // Reset mocks
    mockCollection = {
      insertOne: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      countDocuments: jest.fn()
    };

    // Mock find chain
    mockCollection.find.mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn()
    });

    // Mock database
    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection)
    };

    repository = new MongoExamRepository(mockDb);
  });

  test('constructor initializes correctly', () => {
    expect(repository.db).toBe(mockDb);
    expect(repository.collection).toBe(mockCollection);
    expect(mockDb.collection).toHaveBeenCalledWith('exams');
  });

  test('saveExam should store an exam in the database', async () => {
    const examEntity = {
      title: 'Test Exam',
      description: 'Test Description',
      quizzes: [],
      createdAt: new Date()
    };

    const insertedId = new ObjectId('123456789012');
    mockCollection.insertOne.mockResolvedValue({ insertedId });

    const result = await repository.saveExam(examEntity);

    expect(mockCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining({
      title: examEntity.title,
      description: examEntity.description,
      quizzes: examEntity.quizzes
    }));
    expect(result).toBe('123456789012');
  });

  test('findExams should retrieve paginated exams', async () => {
    const mockExams = [
      { _id: new ObjectId('1'), title: 'Exam 1', quizzes: [] },
      { _id: new ObjectId('2'), title: 'Exam 2', quizzes: [] }
    ];

    const mockToArray = mockCollection.find().toArray;
    mockToArray.mockResolvedValue(mockExams);

    const result = await repository.findExams({ page: 2, limit: 10 });

    expect(mockCollection.find).toHaveBeenCalledWith({});
    expect(mockCollection.find().skip).toHaveBeenCalledWith(10);
    expect(mockCollection.find().limit).toHaveBeenCalledWith(10);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('2');
  });

  test('countExams should return the total number of exams', async () => {
    mockCollection.countDocuments.mockResolvedValue(42);

    const result = await repository.countExams();

    expect(mockCollection.countDocuments).toHaveBeenCalled();
    expect(result).toBe(42);
  });

  test('findExamByTitle should find an exam by title', async () => {
    const mockExam = {
      _id: new ObjectId('123'),
      title: 'Test Exam',
      description: 'Description',
      quizzes: []
    };

    mockCollection.findOne.mockResolvedValue(mockExam);

    const result = await repository.findExamByTitle('Test Exam');

    expect(mockCollection.findOne).toHaveBeenCalledWith({ title: 'Test Exam' });
    expect(result).toEqual(expect.objectContaining({
      id: '123',
      title: 'Test Exam'
    }));
  });

  test('findExamByTitle should return null when no exam is found', async () => {
    mockCollection.findOne.mockResolvedValue(null);

    const result = await repository.findExamByTitle('Nonexistent Exam');

    expect(mockCollection.findOne).toHaveBeenCalledWith({ title: 'Nonexistent Exam' });
    expect(result).toBeNull();
  });

  test('deleteExam should remove an exam by ID', async () => {
    mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });

    const result = await repository.deleteExam('123');

    expect(result).toBe(true);
  });

  test('deleteExam should return false when no exam was deleted', async () => {
    mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });

    const result = await repository.deleteExam('123');

    expect(result).toBe(false);
  });

  test('addQuizToExam should add a quiz to an exam', async () => {
    const quiz = { title: 'New Quiz', questions: [] };
    mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

    const result = await repository.addQuizToExam('Test Exam', quiz);

    expect(mockCollection.updateOne).toHaveBeenCalledWith(
      { title: 'Test Exam' },
      { $push: { quizzes: quiz } }
    );
    expect(result).toBe(true);
  });

  test('addQuizToExam should return false when update fails', async () => {
    mockCollection.updateOne.mockResolvedValue({ modifiedCount: 0 });

    const result = await repository.addQuizToExam('Test Exam', {});

    expect(result).toBe(false);
  });

  test('addQuestionToQuiz should add to existing quiz', async () => {
    const mockExam = {
      title: 'Test Exam',
      quizzes: [{ title: 'Quiz 1', questions: [] }]
    };
    mockCollection.findOne.mockResolvedValue(mockExam);
    mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

    const question = { text: 'New Question', options: [] };
    const result = await repository.addQuestionToQuiz('Test Exam', 'Quiz 1', question);

    expect(mockCollection.updateOne).toHaveBeenCalledWith(
      { title: 'Test Exam', 'quizzes.0.title': 'Quiz 1' },
      { $push: { 'quizzes.0.questions': question } }
    );
    expect(result).toBe(true);
  });

  test('addQuestionToQuiz should create new quiz if not found', async () => {
    const mockExam = {
      title: 'Test Exam',
      quizzes: []
    };
    mockCollection.findOne.mockResolvedValue(mockExam);
    mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

    const question = { text: 'New Question', options: [] };
    const result = await repository.addQuestionToQuiz('Test Exam', 'New Quiz', question);

    expect(mockCollection.updateOne).toHaveBeenCalledWith(
      { title: 'Test Exam' },
      { $push: { quizzes: { title: 'New Quiz', questions: [question] } } }
    );
    expect(result).toBe(true);
  });

  test('addQuestionToQuiz should return false when exam not found', async () => {
    mockCollection.findOne.mockResolvedValue(null);

    const result = await repository.addQuestionToQuiz('Nonexistent', 'Quiz', {});

    expect(result).toBe(false);
  });

  test('deleteQuestionFromQuiz should return false when quiz not found', async () => {
    const mockExam = {
      _id: new ObjectId('123'),
      quizzes: []
    };
    
    mockCollection.findOne.mockResolvedValue(mockExam);
    
    const result = await repository.deleteQuestionFromQuiz('123', 0, 1);
    
    expect(result).toBe(false);
  });

  test('deleteQuestionFromQuiz should return false when question index invalid', async () => {
    const mockExam = {
      _id: new ObjectId('123'),
      quizzes: [{ title: 'Quiz 1', questions: [{ text: 'Q1' }] }]
    };
    
    mockCollection.findOne.mockResolvedValue(mockExam);
    
    const result = await repository.deleteQuestionFromQuiz('123', 0, 5);
    
    expect(result).toBe(false);
  });
});
