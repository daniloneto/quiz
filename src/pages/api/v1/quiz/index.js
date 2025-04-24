import { connectToDatabase } from '../../../../config/database';
import CreateQuizUseCase from '../../../../application/usecases/CreateQuizUseCase';
import MongoExamRepository from '../../../../infrastructure/database/MongoExamRepository';
import { verifyApiKey, authenticateToken } from '../../../../lib/middleware';

export default async function handler(req, res) {
  if (!verifyApiKey(req, res)) return;
  if (!authenticateToken(req, res)) return;
  if (req.method === 'POST') {
    const { examTitle, quiz } = req.body;
    const db = await connectToDatabase();
    const repository = new MongoExamRepository(db);
    const createUseCase = new CreateQuizUseCase({ examRepository: repository });
    try {
      await createUseCase.execute({ examTitle, quiz });
      return res.status(200).json({ message: 'Quiz cadastrado com sucesso' });
    } catch (error) {
      console.error('Erro ao cadastrar o quiz:', error);
      if (error.message === 'Exame não encontrado') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(400).json({ message: error.message });
    }
  }
  res.setHeader('Allow', ['POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}