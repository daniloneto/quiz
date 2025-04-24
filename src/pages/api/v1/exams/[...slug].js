import { connectToDatabase } from '../../../../config/database';
import DeleteExamUseCase from '../../../../application/usecases/DeleteExamUseCase';
import GetQuizByIndexUseCase from '../../../../application/usecases/GetQuizByIndexUseCase';
import MongoExamRepository from '../../../../infrastructure/database/MongoExamRepository';
import { verifyApiKey, authenticateToken } from '../../../../lib/middleware';

export default async function handler(req, res) {
  if (!verifyApiKey(req, res)) return;
  if (!authenticateToken(req, res)) return;
  const { slug } = req.query;
  if (!slug || !Array.isArray(slug)) {
    return res.status(400).json({ message: 'Rota inválida' });
  }
  const db = await connectToDatabase();
  const repository = new MongoExamRepository(db);
  // DELETE /exams/:id
  if (slug.length === 1 && req.method === 'DELETE') {
    const id = slug[0];
    const deleteUseCase = new DeleteExamUseCase({ examRepository: repository });
    try {
      await deleteUseCase.execute({ id });
      return res.status(200).json({ message: 'Prova excluída com sucesso' });
    } catch(err) {
      console.error('Erro ao excluir a prova:', err);
      if (String(err) === 'Error: Prova não encontrada') {
        return res.status(404).json({ message: String(err) });
      }
      return res.status(500).json({ message: 'Erro ao excluir a prova' });
    }
  }
  // GET /exams/:title/quiz/:index
  if (slug.length === 3 && slug[1] === 'quiz' && req.method === 'GET') {
    const title = slug[0];
    const index = parseInt(slug[2], 10);
    const getQuizUseCase = new GetQuizByIndexUseCase({ examRepository: repository });
    try {
      const quiz = await getQuizUseCase.execute({ title, index });
      return res.status(200).json(quiz);
    } catch(err) {
      console.error('Erro ao obter o quiz:', err);
      if (String(err) === 'Error: Prova não encontrada' || String(err) === 'Error: Quiz não encontrado') {
        return res.status(404).json({ message: String(err) });
      }
      return res.status(500).json({ message: 'Erro ao obter o quiz' });
    }
  }
  res.setHeader('Allow', ['DELETE', 'GET']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}