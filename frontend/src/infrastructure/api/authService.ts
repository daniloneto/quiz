import api from './http';
import type { User } from 'src/domain/user';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export async function login(data: LoginPayload): Promise<AuthResponse> {
  const response = await api.post('/auth/login', data);
  return response.data;
}

export async function register(data: RegisterPayload): Promise<void> {
  await api.post('/auth/register', data);
}
