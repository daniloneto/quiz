/**
 * Use case for listing exams with pagination.
 */
class FindAllExamsUseCase {
  constructor({ examRepository }) {
    this.examRepository = examRepository;
  }

  /**
   * Execute listing exams.
   * @returns {Promise<{exams: Array<object>}>}
   */
  async execute() {
    const exams = await this.examRepository.findAllExams()
    return { exams };
  }
}

module.exports = FindAllExamsUseCase;