import { connectToDatabase } from '../../../../config/database';
import UpdatePointsUseCase from '../../../../application/usecases/UpdatePointsUseCase';
import MongoProfileRepository from '../../../../infrastructure/database/MongoProfileRepository';
import LevelCalculatorService from '../../../../domain/services/LevelCalculatorService';
import { verifyApiKey, authenticateToken } from '../../../../lib/middleware';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
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
  } catch (error) {
    console.error('Erro ao atualizar pontos:', error);
    if (error.message === 'Usuário não encontrado') {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
}