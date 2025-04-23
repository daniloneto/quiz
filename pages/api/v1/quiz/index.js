import { connectToDatabase } from '../../../../config/database';
import quizController from '../../../../controllers/quizController';
import { verifyApiKey, authenticateToken } from '../../../../lib/middleware';

export default async function handler(req, res) {
  const db = await connectToDatabase();
  req.app = { locals: { database: db } };
  if (!verifyApiKey(req, res)) return;
  if (!authenticateToken(req, res)) return;
  if (req.method === 'POST') {
    return quizController.createQuiz(req, res);
  }
  res.setHeader('Allow', ['POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}