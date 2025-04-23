import { connectToDatabase } from '../../../../config/database';
import authService from '../../../../services/authService';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ message: 'Token é obrigatório' });
  }
  const db = await connectToDatabase();
  try {
    const result = await authService.confirmEmail(db, token);
    return res.status(200).json({ message: result });
  } catch (error) {
    if (error instanceof authService.UserError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Erro ao confirmar e-mail:', error);
    return res.status(500).json({ message: 'Erro ao confirmar e-mail' });
  }
}