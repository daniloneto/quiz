/**
 * Domain entity representing an exam with multiple quizzes.
 */
class Exam {
  /**
   * @param {object} params
   * @param {string} params.id - Exam identifier
   * @param {string} params.title - Exam title
   * @param {string} [params.description] - Exam description
   * @param {Array<any>} [params.quizzes] - Array of quiz objects
   * @param {Date} [params.createdAt] - Creation timestamp
   */
  constructor({ id, title, description = '', quizzes = [], createdAt = new Date() }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.quizzes = quizzes;
    this.createdAt = createdAt;
  }
}

module.exports = Exam;