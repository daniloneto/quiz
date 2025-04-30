/**
 * Parameters for Option entity.
 */
export interface IOptionParams {
  text: string;
  correct?: boolean;
}

/**
 * Domain entity representing an option for a question.
 */
export default class Option {
  text: string;
  correct: boolean;

  constructor({ text, correct = false }: IOptionParams) {
    this.text = text;
    this.correct = correct;
  }
}