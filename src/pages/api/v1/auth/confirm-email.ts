import { connectToDatabase } from '../../../../config/database';
import ConfirmEmailUseCase from '../../../../application/usecases/ConfirmEmailUseCase';
import MongoAuthRepository from '../../../../infrastructure/database/MongoAuthRepository';

import { emailLimiter } from '../../../../lib/rateLimiter';
import { confirmEmailSchema } from '../../../../lib/validators';
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  // Rate limit
  const key = req.headers['x-api-key'] || req.socket.remoteAddress;
  const { success } = await emailLimiter.limit(key);
  if (!success) {
    return res.status(429).json({ message: 'Too many requests. Please try again later.' });
  }
  // Validate query params
  const parsed = confirmEmailSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Requisição inválida', errors: parsed.error.format() });
  }
  const { token } = parsed.data;
  if (!token) {
    return res.status(400).json({ message: 'Token é obrigatório' });
  }
  const db = await connectToDatabase();
  const repository = new MongoAuthRepository(db);
  const confirmUseCase = new ConfirmEmailUseCase({ authRepository: repository });
  try {
    const { message } = await confirmUseCase.execute({ token });
    return res.status(200).json({ message });
  } catch(err) {
    console.error('Erro ao confirmar e-mail:', err);
    return res.status(400).json({ message: String(err) });
  }
}