import type { LoginPayload, RegisterPayload, AuthResponse } from 'src/infrastructure/api/authService';
import { login as loginService, register as registerService } from 'src/infrastructure/api/authService';

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return loginService(payload);
}

export async function register(payload: RegisterPayload): Promise<void> {
  return registerService(payload);
}
