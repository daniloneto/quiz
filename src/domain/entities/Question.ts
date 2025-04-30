import Option, { IOptionParams } from './Option';

/**
 * Parameters for Question entity.
 */
export interface IQuestionParams {
  question: string;
  options: IOptionParams[];
}

/**
 * Domain entity representing a question with multiple options.
 */
class Question {
  question: string;
  options: Option[];
  /**
   * @param {object} params
   * @param {string} params.question
   * @param {Array<Option>} params.options
   */
  constructor({ question, options }: IQuestionParams) {
    this.question = question;
    this.options = options.map(opt => new Option(opt));
  }
}

export default Question;