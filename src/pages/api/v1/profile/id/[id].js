import { connectToDatabase } from '../../../../../config/database';
import GetProfileUseCase from '../../../../../application/usecases/GetProfileUseCase';
import MongoProfileRepository from '../../../../../infrastructure/database/MongoProfileRepository';
import { verifyApiKey, authenticateToken } from '../../../../../lib/middleware';

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ message: 'ID é obrigatório' });
  }
  if (!verifyApiKey(req, res)) return;
  if (!authenticateToken(req, res)) return;
  if (req.method === 'GET') {
    const db = await connectToDatabase();
    const repository = new MongoProfileRepository(db);
    const getProfileUseCase = new GetProfileUseCase({ profileRepository: repository });
    try {
      const profile = await getProfileUseCase.execute({ id });
      return res.status(200).json({
        _id: profile.id,
        nome: profile.name,
        email: profile.email,
        pontos: profile.points,
        nivel: profile.level,
        data_criacao: profile.createdAt
      });
    } catch (error) {
      console.error('Erro ao buscar o perfil:', error);
      if (error.message === 'Perfil não encontrado') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
    }
  // Method not allowed
  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}