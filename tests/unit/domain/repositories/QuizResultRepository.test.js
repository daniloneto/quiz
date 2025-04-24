const QuizResultRepository = require('../../../../src/domain/repositories/QuizResultRepository');

describe('QuizResultRepository', () => {
  let repository;

  beforeEach(() => {
    repository = new QuizResultRepository();
  });

  test('saveQuizResult should throw not implemented error', async () => {
    await expect(repository.saveQuizResult({}))
      .rejects
      .toThrow('Method not implemented.');
  });

  test('findResultsByUser should throw not implemented error', async () => {
    await expect(repository.findResultsByUser('userId'))
      .rejects
      .toThrow('Method not implemented.');
  });
});
