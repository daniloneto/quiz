import { connectToDatabase } from '../../../../config/database';
import LoginUserUseCase from '../../../../application/usecases/LoginUserUseCase';
import MongoAuthRepository from '../../../../infrastructure/database/MongoAuthRepository';
import Argon2PasswordService from '../../../../infrastructure/services/Argon2PasswordService';
import JwtService from '../../../../infrastructure/services/JwtService';
import { verifyApiKey } from '../../../../lib/middleware';
import { authLimiter } from '../../../../lib/rateLimiter';
import { loginSchema } from '../../../../lib/validators';
import logger from '../../../../config/logger';


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  // Rate limit
  const key = req.headers['x-api-key'] || req.socket.remoteAddress;
  const { success } = await authLimiter.limit(key);
  if (!success) {
    return res.status(429).json({ message: 'Too many requests. Please try again later.' });
  }
  if (!verifyApiKey(req, res)) return;
  // Validate request body
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Requisição inválida', errors: parsed.error.format() });
  }
  const { username, password, loginType } = parsed.data;
  const db = await connectToDatabase();
  const repository = new MongoAuthRepository(db);
  const passwordService = new Argon2PasswordService();
  const jwtService = new JwtService();
  const loginUseCase = new LoginUserUseCase({ authRepository: repository, passwordService, jwtService });
  try {
    const result = await loginUseCase.execute({ username, password, loginType });
    return res.status(200).json(result);
  } catch(err) {
    logger.error('Erro ao logar usuário:', err);
    return res.status(401).json({ message: String(err) });
  }
}