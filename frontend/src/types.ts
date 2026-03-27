export type Session = {
  token: string;
  expiresAt: string;
  uid: string;
  loginType: string;
};

export type Option = {
  text: string;
  correct: boolean;
};

export type Question = {
  question: string;
  options: Option[];
};

export type Quiz = {
  title: string;
  questions: Question[];
};

export type ExamSummary = {
  id: string;
  title: string;
  description?: string;
  quizzes: Quiz[];
  createdAt?: string;
};

export type ExamListResponse = {
  exams: ExamSummary[];
  total: number;
  totalQuizzes: number;
  page: number;
  totalPages: number;
};

export type Profile = {
  _id: string;
  nome: string;
  email: string;
  pontos: number;
  nivel: number;
  data_criacao: string;
};

export type Level = {
  nivel: number;
  pontos: number;
  limiteSuperior: number;
};

export type QuizResult = {
  userId: string;
  examId: string;
  examTitle: string | null;
  quizzes: Array<{
    quizIndex: number;
    answers: Array<{
      correctAnswers: number;
      totalQuestions: number;
      date: string;
    }>;
  }>;
};

export type ApiMessage = {
  message?: string;
  success?: boolean;
};
