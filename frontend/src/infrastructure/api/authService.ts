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

export async function confirmEmail(token: string): Promise<void> {
  await api.get('/auth/confirm-email', { params: { token } });
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await api.post('/auth/reset-password', { token, password });
}
