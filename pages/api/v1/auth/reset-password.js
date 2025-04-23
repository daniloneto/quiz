import { connectToDatabase } from '../../../../config/database';
import authService from '../../../../services/authService';
import { verifyApiKey } from '../../../../lib/middleware';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  // No API key required for reset (assuming public endpoint)
  const { token, newPassword } = req.body;
  const db = await connectToDatabase();
  try {
    await authService.resetPassword(db, { token, newPassword });
    return res.status(200).json({ message: 'Senha redefinida com sucesso.' });
  } catch (error) {
    if (error instanceof authService.UserError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Erro ao resetar senha:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}