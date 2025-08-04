import api from './http';
import type { Question } from 'src/domain/question';
import type { Quiz } from 'src/domain/quiz';

export interface CreateQuizPayload {
  examTitle: string;
  questions: Question[];
}

export async function createQuiz(data: CreateQuizPayload): Promise<void> {
  await api.post('/quiz', data);
}

export async function fetchQuizzesByExam(id: string): Promise<Quiz[]> {
  const response = await api.get(`/quiz/exam/${id}`);
  return response.data;
}

export async function saveQuizResult(data: unknown): Promise<void> {
  await api.post('/quiz/save-quiz-result', data);
}

export async function fetchQuizResults(userId: string): Promise<unknown> {
  const response = await api.get(`/quiz/quiz-results/${userId}`);
  return response.data;
}
