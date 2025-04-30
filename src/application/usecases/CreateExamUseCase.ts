import ExamRepository from '../../domain/repositories/ExamRepository';
import Exam from '../../domain/entities/Exam';

/**
 * Use case for creating a new exam.
 */
class CreateExamUseCase {
  private examRepository: ExamRepository;

  constructor({ examRepository }: { examRepository: ExamRepository }) {
    this.examRepository = examRepository;
  }

  /**
   * Execute creation of an exam.
   * @param {object} params
   * @param {string} params.title
   * @param {string} [params.description]
   * @param {Array<any>} [params.quizzes]
   * @returns {Promise<string>} The created exam ID
   */
  async execute({ title, description, quizzes }: { title: string; description?: string; quizzes?: any[] }): Promise<string> {
    const examEntity = new Exam({ title, description, quizzes });
    const id = await this.examRepository.saveExam(examEntity);
    return id;
  }
}

export default CreateExamUseCase;