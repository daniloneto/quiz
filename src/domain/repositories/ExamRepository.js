/**
 * Interface for exam repository operations.
 */
class ExamRepository {
  /**
   * Save a new exam entity.
   * @param {object} examEntity
   * @returns {Promise<string>} The inserted exam ID
   */
  async saveExam(examEntity) {
    throw new Error('Method not implemented.');
  }

  /**
   * Find exams with pagination.
   * @param {object} params
   * @param {number} params.page
   * @param {number} params.limit
   * @returns {Promise<Array<object>>}
   */
  async findExams({ page, limit }) {
    throw new Error('Method not implemented.');
  }

  /**
   * Count total number of exams.
   * @returns {Promise<number>}
   */
  async countExams() {
    throw new Error('Method not implemented.');
  }

  /**
   * Find an exam by title.
   * @param {string} title
   * @returns {Promise<object|null>}
   */
  async findExamByTitle(title) {
    throw new Error('Method not implemented.');
  }
  
  /**
   * Find an exam by its ID.
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  async findExamById(id) {
    throw new Error('Method not implemented.');
  }
  
  /**
   * Add a quiz to an existing exam identified by title.
   * @param {string} title
   * @param {object} quiz
   * @returns {Promise<boolean>} True if the quiz was added
   */
  async addQuizToExam(title, quiz) {
    throw new Error('Method not implemented.');
  }
  
  /**
   * Add a question to a specific quiz within an exam.
   * @param {string} examTitle
   * @param {string} quizTitle
   * @param {object} questionEntity
   * @returns {Promise<boolean>} True if added
   */
  async addQuestionToQuiz(examTitle, quizTitle, questionEntity) {
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
  async updateQuestionInQuiz(examId, quizIndex, questionIndex, questionEntity) {
    throw new Error('Method not implemented.');
  }

  /**
   * Delete a question from a quiz in an exam.
   * @param {string} examId
   * @param {number} quizIndex
   * @param {number} questionIndex
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteQuestionFromQuiz(examId, quizIndex, questionIndex) {
    throw new Error('Method not implemented.');
  }

  /**
   * Delete an exam by ID.
   * @param {string} id
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  async deleteExam(id) {
    throw new Error('Method not implemented.');
  }
}

module.exports = ExamRepository;