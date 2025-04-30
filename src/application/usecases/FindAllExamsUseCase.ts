import ExamRepository from '../../domain/repositories/ExamRepository';
/**
 * Use case for listing exams with pagination.
 */
class FindAllExamsUseCase {
  private examRepository: ExamRepository;

  constructor({ examRepository }: { examRepository: ExamRepository }) {
    this.examRepository = examRepository;
  }

  /**
   * Execute listing exams.
   * @returns {Promise<{exams: Array<object>}>}
   */
  async execute(): Promise<{ exams: any[] }> {
    const exams = await this.examRepository.findAllExams()
    return { exams };
  }
}

export default FindAllExamsUseCase;