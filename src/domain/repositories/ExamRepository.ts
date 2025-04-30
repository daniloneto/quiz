import { IExamParams } from '../entities/Exam';

/**
 * Abstract repository for exam operations.
 */
export default class ExamRepository {
  /**
   * Save a new exam entity.
   * @param {object} examEntity
   * @returns {Promise<string>} The inserted exam ID
   */
  async saveExam(examEntity: IExamParams): Promise<string> {
    throw new Error('Method not implemented.');
  }

  /**
   * Find exams with pagination.
   * @param {object} params
   * @param {number} params.page
   * @param {number} params.limit
   * @returns {Promise<Array<object>>}
   */
  async findExams(params: { page: number; limit: number }): Promise<IExamParams[]> {
    throw new Error('Method not implemented.');
  }
  /**
   * Find all exams without pagination.
   * @returns {Promise<IExamParams[]>}
   */
  async findAllExams(): Promise<IExamParams[]> {
    throw new Error('Method not implemented.');
  }

  /**
   * Count total number of exams.
   * @returns {Promise<number>}
   */
  async countExams(): Promise<number> {
    throw new Error('Method not implemented.');
  }

  /**
   * Find an exam by title.
   * @param {string} title
   * @returns {Promise<object|null>}
   */
  async findExamByTitle(title: string): Promise<IExamParams | null> {
    throw new Error('Method not implemented.');
  }
  
  /**
   * Find an exam by its ID.
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  async findExamById(id: string): Promise<IExamParams | null> {
    throw new Error('Method not implemented.');
  }
  
  /**
   * Add a quiz to an existing exam identified by title.
   * @param {string} title
   * @param {object} quiz
   * @returns {Promise<boolean>} True if the quiz was added
   */
  async addQuizToExam(title: string, quiz: any): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  
  /**
   * Add a question to a specific quiz within an exam.
   * @param {string} examTitle
   * @param {string} quizTitle
   * @param {object} questionEntity
   * @returns {Promise<boolean>} True if added
   */
  async addQuestionToQuiz(examTitle: string, quizTitle: string, questionEntity: any): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  /**
   * Update a question within a quiz for a given exam.
   * @param {string} examId
   * @param {number} quizIndex
   * @param {number} questionIndex
   * @param {object} questionEntity
   * @returns {Promise<boolean>} True if updated
   */
  async updateQuestionInQuiz(examId: string, quizIndex: number, questionIndex: number, questionEntity: any): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  /**
   * Delete a question from a quiz in an exam.
   * @param {string} examId
   * @param {number} quizIndex
   * @param {number} questionIndex
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteQuestionFromQuiz(examId: string, quizIndex: number, questionIndex: number): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  /**
   * Delete an exam by ID.
   * @param {string} id
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  async deleteExam(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}