import api from './http';
import type { Exam } from 'src/domain/exam';
import type { Quiz } from 'src/domain/quiz';

export interface ExamsResponse {
  items: Exam[];
  total: number;
}

export async function fetchExams(page = 1, limit = 10): Promise<ExamsResponse> {
  const response = await api.get('/exams', { params: { page, limit } });
  return response.data;
}

export interface CreateExamPayload {
  title: string;
  description?: string;
}

export async function createExam(data: CreateExamPayload): Promise<Exam> {
  const response = await api.post('/exams', data);
  return response.data;
}

export async function deleteExam(id: string): Promise<void> {
  await api.delete(`/exams/${id}`);
}

export async function fetchExamQuiz(title: string, index: number): Promise<Quiz> {
  const response = await api.get(`/exams/${title}/quiz/${index}`);
  return response.data;
}
