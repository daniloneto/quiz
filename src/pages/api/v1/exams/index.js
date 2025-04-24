import { connectToDatabase } from '../../../../config/database';
import CreateExamUseCase from '../../../../application/usecases/CreateExamUseCase';
import ListExamsUseCase from '../../../../application/usecases/ListExamsUseCase';
import MongoExamRepository from '../../../../infrastructure/database/MongoExamRepository';
import { verifyApiKey, authenticateToken } from '../../../../lib/middleware';

export default async function handler(req, res) {
  if (!verifyApiKey(req, res)) return;
  if (!authenticateToken(req, res)) return;
  const db = await connectToDatabase();
  const repository = new MongoExamRepository(db);
  switch (req.method) {
    case 'GET': {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const listUseCase = new ListExamsUseCase({ examRepository: repository });
      try {
        const result = await listUseCase.execute({ page, limit });
        return res.status(200).json(result);
      } catch (error) {
        console.error('Erro ao obter as provas:', error);
        return res.status(500).json({ message: 'Erro ao obter as provas' });
      }
    }
    case 'POST': {
      const createUseCase = new CreateExamUseCase({ examRepository: repository });
      try {
        await createUseCase.execute(req.body);
        return res.status(201).json({ message: 'Prova cadastrada com sucesso' });
      } catch (error) {
        console.error('Erro ao cadastrar a prova:', error);
        return res.status(400).json({ message: error.message });
      }
    }
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}