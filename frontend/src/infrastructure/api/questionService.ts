import api from './http';

export interface AddQuestionPayload {
  examId: string;
  quizIndex: number;
  statement: string;
  options: string[];
  correctOption: number;
}

export async function addQuestion(data: AddQuestionPayload): Promise<void> {
  await api.post('/question', data);
}

export interface UpdateQuestionPayload {
  examId: string;
  quizIndex: number;
  questionIndex: number;
  optionIndex: number;
  newValue: string;
}

export async function updateQuestion(data: UpdateQuestionPayload): Promise<void> {
  await api.put('/question', data);
}

export interface DeleteQuestionPayload {
  examId: string;
  quizIndex: number;
  questionIndex: number;
}

export async function deleteQuestion(data: DeleteQuestionPayload): Promise<void> {
  await api.delete('/question', { data });
}
