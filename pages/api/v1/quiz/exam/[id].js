import { connectToDatabase } from '../../../../../config/database';
import quizController from '../../../../../controllers/quizController';
import { verifyApiKey, authenticateToken } from '../../../../../lib/middleware';

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ message: 'id é obrigatório' });
  }
  const db = await connectToDatabase();
  req.app = { locals: { database: db } };
  if (!verifyApiKey(req, res)) return;
  if (!authenticateToken(req, res)) return;
  if (req.method === 'GET') {
    // Map to Express-style params
    req.params = { id };
    return quizController.getQuizByExam(req, res);
  }
  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}