import ExamRepository from '../../domain/repositories/ExamRepository';
/**
 * Use case for listing exams with pagination.
 */
class ListExamsUseCase {
  private examRepository: ExamRepository;

  constructor({ examRepository }: { examRepository: ExamRepository }) {
    this.examRepository = examRepository;
  }

  /**
   * Execute listing exams.
   * @param {object} params
   * @param {number} params.page
   * @param {number} params.limit
   * @returns {Promise<{exams: Array<object>, total: number, totalQuizzes: number, page: number, totalPages: number}>}
   */
  async execute({ page, limit }: { page: number; limit: number }): Promise<{ exams: any[]; total: number; totalQuizzes: number; page: number; totalPages: number }> {
    const exams = await this.examRepository.findExams({ page, limit });
    const total = await this.examRepository.countExams();
    const totalQuizzes = await this.examRepository.countQuizzes();
    const totalPages = Math.ceil(total / limit);
    return { exams, total, totalQuizzes, page, totalPages };
  }
}

export default ListExamsUseCase;
