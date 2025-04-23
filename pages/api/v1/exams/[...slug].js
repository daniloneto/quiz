import { connectToDatabase } from '../../../../config/database';
import examsController from '../../../../controllers/examsController';
import { verifyApiKey, authenticateToken } from '../../../../lib/middleware';

export default async function handler(req, res) {
  const db = await connectToDatabase();
  req.app = { locals: { database: db } };
  if (!verifyApiKey(req, res)) return;
  if (!authenticateToken(req, res)) return;
  const { slug } = req.query;
  if (!slug || !Array.isArray(slug)) {
    return res.status(400).json({ message: 'Rota inválida' });
  }
  // DELETE /exams/:id
  if (slug.length === 1 && req.method === 'DELETE') {
    req.params = { id: slug[0] };
    return examsController.deleteExam(req, res);
  }
  // GET /exams/:title/quiz/:index
  if (slug.length === 3 && slug[1] === 'quiz' && req.method === 'GET') {
    req.params = { title: slug[0], index: slug[2] };
    return examsController.getQuizByIndex(req, res);
  }
  res.setHeader('Allow', ['DELETE', 'GET']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}