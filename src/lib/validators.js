import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'username is required'),
  password: z.string().min(1, 'password is required'),
  loginType: z.string().min(1, 'loginType is required'),
});

export const registerSchema = z.object({
  username: z.string().min(1, 'username is required'),
  password: z.string().min(6, 'password must be at least 6 characters'),
  nome: z.string().min(1, 'name is required'),
  email: z.string().email('invalid email'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('invalid email'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'token is required'),
  newPassword: z.string().min(6, 'password must be at least 6 characters'),
});

export const confirmEmailSchema = z.object({
  token: z.string().min(1, 'token is required'),
});