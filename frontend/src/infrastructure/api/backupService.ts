import api from './http';

export async function createBackup(): Promise<Blob> {
  const response = await api.post('/backup/create', undefined, { responseType: 'blob' });
  return response.data;
}
