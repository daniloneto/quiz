import api from './http';

export async function uploadFile(form: FormData): Promise<unknown> {
  const response = await api.post('/upload/gpt-integration', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}
