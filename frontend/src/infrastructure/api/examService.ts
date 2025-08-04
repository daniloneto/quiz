import api from './http';
import type { Exam } from 'src/domain/exam';

export interface ExamsResponse {
  exams: Exam[];
  total: number;
  page: number;
  totalPages: number;
}

export async function fetchExams(page = 1, limit = 10): Promise<ExamsResponse> {
  const response = await api.get('/exams', { params: { page, limit } });
  return response.data;
}
