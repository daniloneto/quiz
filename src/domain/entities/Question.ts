import Option, { IOptionParams } from './Option';

export type QuestionType = "multiple-choice" | "true-false" | "short-answer";

/**
 * Parameters for Question entity.
 */
export interface IQuestionParams {
  id?: string; // Added for unique identification
  question: string;
  options: IOptionParams[];
  questionType: QuestionType;
  answerKey?: string;
}

/**
 * Domain entity representing a question with multiple options.
 */
class Question {
  question: string;
  options: Option[];
  questionType: QuestionType;
  answerKey?: string;

  /**
   * @param {object} params
   * @param {string} params.question
   * @param {Array<Option>} params.options
   * @param {QuestionType} params.questionType
   * @param {string} [params.answerKey]
   */
  constructor({ question, options, questionType, answerKey }: IQuestionParams) {
    this.question = question;
    this.options = options.map(opt => new Option(opt));
    this.questionType = questionType;
    this.answerKey = answerKey;
  }
}

export default Question;