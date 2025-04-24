import { connectToDatabase } from '../../../../config/database';
import GetLevelsUseCase from '../../../../application/usecases/GetLevelsUseCase';
import MongoProfileRepository from '../../../../infrastructure/database/MongoProfileRepository';
import { verifyApiKey, authenticateToken } from '../../../../lib/middleware';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  if (!verifyApiKey(req, res)) return;
  if (!authenticateToken(req, res)) return;
  const db = await connectToDatabase();
  const repository = new MongoProfileRepository(db);
  const getLevelsUseCase = new GetLevelsUseCase({ profileRepository: repository });
  try {
    const levels = await getLevelsUseCase.execute();
    const dto = levels.map(lvl => ({ nivel: lvl.level, pontos: lvl.minPoints, limiteSuperior: lvl.maxPoints }));
    return res.status(200).json(dto);
  } catch(err) {
    console.error('Erro ao buscar os níveis:', err);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}