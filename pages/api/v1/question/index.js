import { connectToDatabase } from '../../../../config/database';
import questionController from '../../../../controllers/questionController';
import { verifyApiKey, authenticateToken } from '../../../../lib/middleware';

export default async function handler(req, res) {
  const db = await connectToDatabase();
  req.app = { locals: { database: db } };
  if (!verifyApiKey(req, res)) return;
  if (!authenticateToken(req, res)) return;
  switch (req.method) {
    case 'PUT':
      return questionController.updateQuestion(req, res);
    case 'POST':
      return questionController.addQuestion(req, res);
    case 'DELETE':
      return questionController.deleteQuestion(req, res);
    default:
      res.setHeader('Allow', ['PUT', 'POST', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}