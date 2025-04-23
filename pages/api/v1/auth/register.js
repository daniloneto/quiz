import { connectToDatabase } from '../../../../config/database';
import authService from '../../../../services/authService';
import emailService from '../../../../services/emailService';
import { verifyApiKey } from '../../../../lib/middleware';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  if (!verifyApiKey(req, res)) return;
  const { username, password, nome, email } = req.body;
  const db = await connectToDatabase();
  // Attach database to req for compatibility
  req.app = { locals: { database: db } };
  try {
    const result = await authService.registerUser(db, { username, password, nome, email });
    await emailService.sendActivationEmail(email, result.verificationToken);
    return res.status(200).json({ message: 'Registrado com sucesso. Enviamos um e-mail para ativação da conta' });
  } catch (error) {
    if (error instanceof authService.UserError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Erro ao registrar usuário:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}