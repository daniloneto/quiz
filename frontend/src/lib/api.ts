import type { ExamListResponse, ExamSummary, Level, Profile, Quiz, QuizResult, Session } from '../types';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

type RequestOptions = {
  method?: HttpMethod;
  body?: BodyInit | Record<string, unknown> | null;
  session?: Session | null;
  query?: Record<string, string | number | undefined>;
  headers?: Record<string, string>;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function buildUrl(path: string, query?: Record<string, string | number | undefined>) {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api/frontend';
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const url = new URL(`${normalizedBase}/${path}`, window.location.origin);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, session, query, headers = {} } = options;
  const finalHeaders = new Headers(headers);
  if (session?.token) {
    finalHeaders.set('Authorization', `Bearer ${session.token}`);
  }

  let payload: BodyInit | undefined;
  if (body instanceof FormData || typeof body === 'string' || body == null) {
    payload = body ?? undefined;
  } else {
    payload = JSON.stringify(body);
    finalHeaders.set('Content-Type', 'application/json');
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers: finalHeaders,
    body: method === 'GET' ? undefined : payload
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof data === 'string'
        ? data
        : data?.message || data?.error || `Falha na requisição (${response.status})`;
    throw new ApiError(message, response.status);
  }

  return data as T;
}

export const api = {
  login: (body: { username: string; password: string; loginType: string }) =>
    request<Session>('auth/login', { method: 'POST', body }),
  register: (body: { username: string; password: string; nome: string; email: string }) =>
    request<{ message: string }>('auth/register', { method: 'POST', body }),
  forgotPassword: (body: { email: string }) =>
    request<{ message: string }>('auth/forgot-password', { method: 'POST', body }),
  resetPassword: (body: { token: string; newPassword: string }) =>
    request<{ message: string }>('auth/reset-password', { method: 'POST', body }),
  confirmEmail: (token: string) =>
    request<{ message: string }>('auth/confirm-email', { query: { token } }),
  protectedCheck: (session: Session | null) =>
    request<{ message: string }>('auth/protected', { session }),
  listExams: (session: Session | null, page = 1, limit = 12) =>
    request<ExamListResponse>('exams', { session, query: { page, limit } }),
  createExam: (session: Session | null, body: { title: string; description?: string }) =>
    request<{ message: string }>('exams', { method: 'POST', body, session }),
  getExamById: (session: Session | null, id: string) =>
    request<ExamSummary>(`exams/${id}`, { session }),
  deleteExam: (session: Session | null, id: string) =>
    request<{ message: string }>(`exams/${id}`, { method: 'DELETE', session }),
  createQuiz: (session: Session | null, body: { examTitle: string; quiz: Quiz }) =>
    request<{ message: string }>('quiz', { method: 'POST', body, session }),
  getQuizzesByExam: (session: Session | null, examId: string) =>
    request<Quiz[]>(`quiz/exam/${examId}`, { session }),
  getQuizByIndex: (session: Session | null, title: string, quizIndex: number) =>
    request<Quiz>(`exams/${title}/quiz/${quizIndex}`, { session }),
  addQuestion: (
    session: Session | null,
    body: {
      exam: string;
      quiz: string;
      question: string;
      optionA: string;
      optionB: string;
      optionC: string;
      optionD: string;
      correctOption: string;
    }
  ) => request<{ message: string }>('question', { method: 'POST', body, session }),
  updateQuestion: (
    session: Session | null,
    body: { examId: string; quizIndex: number; questionIndex: number; optionIndex?: number; newValue: string }
  ) => request<{ message: string }>('question', { method: 'PUT', body, session }),
  deleteQuestion: (session: Session | null, body: { examId: string; quizIndex: number; questionIndex: number }) =>
    request<{ message: string }>('question', { method: 'DELETE', body, session }),
  uploadQuestions: (session: Session | null, formData: FormData) =>
    request<{ message?: string; success?: boolean }>('upload', { method: 'POST', body: formData, session }),
  crawlQuestions: (
    session: Session | null,
    body: { numQuestions: number; quizTitle: string; examTitle: string; lingua: string; urls: string[] }
  ) => request<{ success: boolean; message: string; questionCount?: number }>('crawler', { method: 'POST', body, session }),
  getProfile: (session: Session | null, userId: string) =>
    request<Profile>(`profile/${userId}`, { session }),
  getLevels: (session: Session | null) => request<Level[]>('profile/levels', { session }),
  updatePoints: (session: Session | null, body: { userId: string; pontos: number }) =>
    request<{ success: boolean; nivel?: number; message?: string }>('profile/update-points', { method: 'POST', body, session }),
  saveQuizResult: (
    session: Session | null,
    body: { userId: string; examId: string; quizIndex: number; correctAnswers: number; totalQuestions: number }
  ) => request<{ message: string; resultId?: string }>('quiz/save-result', { method: 'POST', body, session }),
  getQuizResults: (session: Session | null, userId: string) =>
    request<QuizResult[]>(`quiz/results/${userId}`, { session }),
  createBackup: (session: Session | null) =>
    request<string>('backup/create', { method: 'POST', session }),
  getOpenApi: () => request<Record<string, unknown>>('system/openapi')
};
