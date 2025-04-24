/**
 * Use case for listing exams with pagination.
 */
class ListExamsUseCase {
  constructor({ examRepository }) {
    this.examRepository = examRepository;
  }

  /**
   * Execute listing exams.
   * @param {object} params
   * @param {number} params.page
   * @param {number} params.limit
   * @returns {Promise<{exams: Array<object>, total: number, page: number, totalPages: number}>}
   */
  async execute({ page, limit }) {
    const exams = await this.examRepository.findExams({ page, limit });
    const total = await this.examRepository.countExams();
    const totalPages = Math.ceil(total / limit);
    return { exams, total, page, totalPages };
  }
}

module.exports = ListExamsUseCase;