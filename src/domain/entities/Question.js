import Option from './Option';

/**
 * Domain entity representing a question with multiple options.
 */
class Question {
  /**
   * @param {object} params
   * @param {string} params.question
   * @param {Array<Option>} params.options
   */
  constructor({ question, options }) {
    this.question = question;
    this.options = options.map(opt => new Option(opt));
  }
}

export default Question;