import api from './http';
import type { Profile, Level } from 'src/domain/profile';

export async function fetchProfile(id: string): Promise<Profile> {
  const response = await api.get(`/profile/id/${id}`);
  return response.data;
}

export async function fetchLevels(): Promise<Level[]> {
  const response = await api.get('/profile/levels');
  return response.data;
}

export async function updatePoints(userId: string, points: number): Promise<void> {
  await api.post('/profile/atualizar-pontos', { userId, points });
}
