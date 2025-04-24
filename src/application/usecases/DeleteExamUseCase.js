/**
 * Use case for deleting an exam by ID.
 */
class DeleteExamUseCase {
  constructor({ examRepository }) {
    this.examRepository = examRepository;
  }

  /**
   * Execute deletion of an exam.
   * @param {object} params
   * @param {string} params.id
   * @returns {Promise<void>}
   */
  async execute({ id }) {
    const deleted = await this.examRepository.deleteExam(id);
    if (!deleted) {
      throw new Error('Prova não encontrada');
    }
  }
}

module.exports = DeleteExamUseCase;