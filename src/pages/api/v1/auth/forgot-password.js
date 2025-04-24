import { connectToDatabase } from '../../../../config/database';
import ForgotPasswordUseCase from '../../../../application/usecases/ForgotPasswordUseCase';
import MongoAuthRepository from '../../../../infrastructure/database/MongoAuthRepository';
import VerificationTokenService from '../../../../infrastructure/services/VerificationTokenService';
import EmailService from '../../../../infrastructure/services/EmailService';
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
  const repository = new MongoAuthRepository(db);
  const tokenService = new VerificationTokenService();
  const forgotUseCase = new ForgotPasswordUseCase({ authRepository: repository, tokenService });
  const emailService = new EmailService();
  try {
    const { verificationToken } = await forgotUseCase.execute({ email: sanitizedEmail });
    await emailService.sendResetPasswordEmail(sanitizedEmail, verificationToken);
    return res.status(200).json({ message: 'E-mail de redefinição de senha enviado.' });
  } catch (error) {
    console.error('Erro ao processar forgot-password:', error);
    return res.status(400).json({ message: error.message });
  }
}