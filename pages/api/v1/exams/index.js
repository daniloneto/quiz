import { connectToDatabase } from '../../../../config/database';
import examsController from '../../../../controllers/examsController';
import { verifyApiKey, authenticateToken } from '../../../../lib/middleware';

export default async function handler(req, res) {
  const db = await connectToDatabase();
  req.app = { locals: { database: db } };
  if (!verifyApiKey(req, res)) return;
  if (!authenticateToken(req, res)) return;
  switch (req.method) {
    case 'GET':
      return examsController.getAllExams(req, res);
    case 'POST':
      return examsController.createExam(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}