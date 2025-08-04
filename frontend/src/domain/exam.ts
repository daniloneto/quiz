export interface QuestionOption {
  text: string;
  correct: boolean;
}

export interface Question {
  question: string;
  options: QuestionOption[];
}

export interface Quiz {
  title: string;
  questions: Question[];
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  quizzes: Quiz[];
  createdAt?: string;
}
