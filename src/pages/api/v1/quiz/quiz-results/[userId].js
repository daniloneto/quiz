import { connectToDatabase } from '../../../../../config/database';
import GetQuizResultsUseCase from '../../../../../application/usecases/GetQuizResultsUseCase';
import MongoQuizResultRepository from '../../../../../infrastructure/database/MongoQuizResultRepository';
import MongoExamRepository from '../../../../../infrastructure/database/MongoExamRepository';
import { verifyApiKey, authenticateToken } from '../../../../../lib/middleware';

export default async function handler(req, res) {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ message: 'userId é obrigatório' });
  }
  if (!verifyApiKey(req, res)) return;
  if (!authenticateToken(req, res)) return;
  if (req.method === 'GET') {
    const db = await connectToDatabase();
    const quizResultRepo = new MongoQuizResultRepository(db);
    const examRepo = new MongoExamRepository(db);
    const getResultsUseCase = new GetQuizResultsUseCase({ quizResultRepository: quizResultRepo, examRepository: examRepo });
    try {
      const results = await getResultsUseCase.execute({ userId });
      return res.status(200).json(results);
    } catch (error) {
      console.error('Erro ao obter resultados dos quizzes:', error);
      if (error.message === 'Nenhum resultado encontrado para este usuário.') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }
  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}