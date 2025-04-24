import { connectToDatabase } from '../../../../../config/database';
import GetQuizzesByExamUseCase from '../../../../../application/usecases/GetQuizzesByExamUseCase';
import MongoExamRepository from '../../../../../infrastructure/database/MongoExamRepository';
import { verifyApiKey, authenticateToken } from '../../../../../lib/middleware';

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ message: 'id é obrigatório' });
  }
  if (!verifyApiKey(req, res)) return;
  if (!authenticateToken(req, res)) return;
  if (req.method === 'GET') {
    const db = await connectToDatabase();
    const repository = new MongoExamRepository(db);
    const getUseCase = new GetQuizzesByExamUseCase({ examRepository: repository });
    try {
      const quizzes = await getUseCase.execute({ examId: id });
      return res.status(200).json(quizzes);
    } catch (error) {
      console.error('Erro ao obter o quiz:', error);
      if (error.message === 'Exame não encontrado') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Erro ao obter o quiz' });
    }
  }
  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}