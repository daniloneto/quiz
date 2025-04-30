import { connectToDatabase } from '../../../../config/database';
import UpdatePointsUseCase from '../../../../application/usecases/UpdatePointsUseCase';
import MongoProfileRepository from '../../../../infrastructure/database/MongoProfileRepository';
import LevelCalculatorService from '../../../../domain/services/LevelCalculatorService';
import { verifyApiKey, authenticateToken } from '../../../../lib/middleware';
import { apiLimiter } from '../../../../lib/rateLimiter';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  // Rate limit
  const key = req.headers['x-api-key'] || req.socket.remoteAddress;
  const { success } = await apiLimiter.limit(key);
  if (!success) {
    return res.status(429).json({ message: 'Too many requests. Please try again later.' });
  }
  if (!verifyApiKey(req, res)) return;
  if (!authenticateToken(req, res)) return;
  const { userId, pontos } = req.body;
  const db = await connectToDatabase();
  const repository = new MongoProfileRepository(db);
  const levelCalculator = new LevelCalculatorService();
  const updatePointsUseCase = new UpdatePointsUseCase({ profileRepository: repository, levelCalculator });
  try {
    const result = await updatePointsUseCase.execute({ userId, points: pontos });
    return res.status(200).json({ success: true, nivel: result.nivel });
  } catch(err) {
    console.error('Erro ao atualizar pontos:', err);
    if (String(err) === 'Error: Usuário não encontrado') {
      return res.status(404).json({ success: false, message: String(err) });
    }
    return res.status(400).json({ success: false, message: String(err) });
  }
}