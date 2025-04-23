import { connectToDatabase } from '../../../../../config/database';
import quizController from '../../../../../controllers/quizController';
import { verifyApiKey, authenticateToken } from '../../../../../lib/middleware';

export default async function handler(req, res) {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ message: 'userId é obrigatório' });
  }
  const db = await connectToDatabase();
  req.app = { locals: { database: db } };
  if (!verifyApiKey(req, res)) return;
  if (!authenticateToken(req, res)) return;
  if (req.method === 'GET') {
    // Map to Express-style params
    req.params = { userId };
    return quizController.getQuizResults(req, res);
  }
  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}