import ExamRepository from '../../domain/repositories/ExamRepository';
/**
 * Use case for deleting an exam by ID.
 */
class DeleteExamUseCase {
  private examRepository: ExamRepository;

  constructor({ examRepository }: { examRepository: ExamRepository }) {
    this.examRepository = examRepository;
  }

  /**
   * Execute deletion of an exam.
   * @param {object} params
   * @param {string} params.id
   * @returns {Promise<void>}
   */
  async execute({ id }: { id: string }): Promise<void> {
    const deleted = await this.examRepository.deleteExam(id);
    if (!deleted) {
      throw new Error('Prova não encontrada');
    }
  }
}

export default DeleteExamUseCase;