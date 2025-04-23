import { connectToDatabase } from '../../../../config/database';
import authService from '../../../../services/authService';
import emailService from '../../../../services/emailService';
import { verifyApiKey } from '../../../../lib/middleware';
import validator from 'validator';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  if (!verifyApiKey(req, res)) return;
  const { email } = req.body;
  const sanitizedEmail = validator.normalizeEmail(email);
  if (!validator.isEmail(sanitizedEmail)) {
    return res.status(400).json({ message: 'E-mail inválido.' });
  }
  const db = await connectToDatabase();
  req.app = { locals: { database: db } };
  try {
    const result = await authService.forgotPassword(db, sanitizedEmail);
    await emailService.sendResetPasswordEmail(sanitizedEmail, result.verificationToken);
    return res.status(200).json({ message: 'E-mail de redefinição de senha enviado.' });
  } catch (error) {
    if (error instanceof authService.UserError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Erro ao processar forgot-password:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}