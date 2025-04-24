import { connectToDatabase } from '../../../../config/database';
import SaveQuizResultUseCase from '../../../../application/usecases/SaveQuizResultUseCase';
import MongoQuizResultRepository from '../../../../infrastructure/database/MongoQuizResultRepository';
import { verifyApiKey, authenticateToken } from '../../../../lib/middleware';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  if (!verifyApiKey(req, res)) return;
  if (!authenticateToken(req, res)) return;
  const { userId, examId, quizIndex, correctAnswers, totalQuestions } = req.body;
  const db = await connectToDatabase();
  const quizResultRepo = new MongoQuizResultRepository(db);
  const saveUseCase = new SaveQuizResultUseCase({ quizResultRepository: quizResultRepo });
  try {
    const { upserted, resultId } = await saveUseCase.execute({ userId, examId, quizIndex, correctAnswers, totalQuestions });
    if (upserted) {
      return res.status(201).json({ message: 'Resultado do quiz salvo com sucesso.', resultId });
    }
    return res.status(200).json({ message: 'Resultado do quiz atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro ao salvar resultado do quiz:', error);
    return res.status(400).json({ message: error.message });
  }
}