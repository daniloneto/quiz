import { connectToDatabase } from '../../../../config/database';
import ResetPasswordUseCase from '../../../../application/usecases/ResetPasswordUseCase';
import MongoAuthRepository from '../../../../infrastructure/database/MongoAuthRepository';
import Argon2PasswordService from '../../../../infrastructure/services/Argon2PasswordService';
import { resetLimiter } from '../../../../lib/rateLimiter';
import { resetPasswordSchema } from '../../../../lib/validators';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  // Rate limit public reset endpoint
  const key = req.socket.remoteAddress;
  const { success } = await resetLimiter.limit(key);
  if (!success) {
    return res.status(429).json({ message: 'Too many requests. Please try again later.' });
  }
  // No API key required for reset (public endpoint)
  // Validate request body
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Requisição inválida', errors: parsed.error.format() });
  }
  const { token, newPassword } = parsed.data;
  const db = await connectToDatabase();
  const repository = new MongoAuthRepository(db);
  const passwordService = new Argon2PasswordService();
  const resetUseCase = new ResetPasswordUseCase({ authRepository: repository, passwordService });
  try {
    const result = await resetUseCase.execute({ token, newPassword });
    return res.status(200).json(result);
  } catch(err) {
    console.error('Erro ao resetar senha:', err);
    return res.status(400).json({ message: String(err) });
  }
}