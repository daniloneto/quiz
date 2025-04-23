import { connectToDatabase } from '../../../../config/database';
import authService from '../../../../services/authService';
import { verifyApiKey } from '../../../../lib/middleware';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  if (!verifyApiKey(req, res)) return;
  const { username, password, loginType } = req.body;
  const db = await connectToDatabase();
  req.app = { locals: { database: db } };
  try {
    const result = await authService.loginUser(db, { username, password, loginType });
    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof authService.UserError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Erro ao logar usuário:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}