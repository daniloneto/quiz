/**
 * Domain entity representing an option for a question.
 */
class Option {
  /**
   * @param {object} params
   * @param {string} params.text
   * @param {boolean} [params.correct=false]
   */
  constructor({ text, correct = false }) {
    this.text = text;
    this.correct = correct;
  }
}

module.exports = Option;