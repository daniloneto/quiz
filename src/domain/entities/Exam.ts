/**
 * Domain entity representing an exam with multiple quizzes.
 */
export interface IExamParams {
  /** Optional for creation; repository assigns ID. */
  id?: string;
  title: string;
  description?: string;
  quizzes?: any[];
  createdAt?: Date;
}

/**
 * Exam domain entity.
 */
export default class Exam {
  id: string;
  title: string;
  description: string;
  quizzes: any[];
  createdAt: Date;

  constructor({ id = '', title, description = '', quizzes = [], createdAt = new Date() }: IExamParams) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.quizzes = quizzes;
    this.createdAt = createdAt;
  }
}