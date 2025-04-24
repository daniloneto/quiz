import ExamRepository from '../../../../src/domain/repositories/ExamRepository';

describe('ExamRepository', () => {
  let repository;

  beforeEach(() => {
    repository = new ExamRepository();
  });

  it('saveExam throws not implemented error', async () => {
    await expect(repository.saveExam({})).rejects.toThrow('Method not implemented.');
  });

  it('findExams throws not implemented error', async () => {
    await expect(repository.findExams({ page: 1, limit: 10 })).rejects.toThrow('Method not implemented.');
  });

  it('countExams throws not implemented error', async () => {
    await expect(repository.countExams()).rejects.toThrow('Method not implemented.');
  });

  it('findExamByTitle throws not implemented error', async () => {
    await expect(repository.findExamByTitle('title')).rejects.toThrow('Method not implemented.');
  });

  it('findExamById throws not implemented error', async () => {
    await expect(repository.findExamById('123')).rejects.toThrow('Method not implemented.');
  });

  it('addQuizToExam throws not implemented error', async () => {
    await expect(repository.addQuizToExam('title', {})).rejects.toThrow('Method not implemented.');
  });

  it('addQuestionToQuiz throws not implemented error', async () => {
    await expect(repository.addQuestionToQuiz('exam', 'quiz', {})).rejects.toThrow('Method not implemented.');
  });

  it('updateQuestionInQuiz throws not implemented error', async () => {
    await expect(repository.updateQuestionInQuiz('123', 0, 0, {})).rejects.toThrow('Method not implemented.');
  });

  it('deleteQuestionFromQuiz throws not implemented error', async () => {
    await expect(repository.deleteQuestionFromQuiz('123', 0, 0)).rejects.toThrow('Method not implemented.');
  });

  it('deleteExam throws not implemented error', async () => {
    await expect(repository.deleteExam('123')).rejects.toThrow('Method not implemented.');
  });
});
