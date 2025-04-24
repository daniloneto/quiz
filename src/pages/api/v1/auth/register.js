import { connectToDatabase } from '../../../../config/database';
import RegisterUserUseCase from '../../../../application/usecases/RegisterUserUseCase';
import MongoAuthRepository from '../../../../infrastructure/database/MongoAuthRepository';
import Argon2PasswordService from '../../../../infrastructure/services/Argon2PasswordService';
import VerificationTokenService from '../../../../infrastructure/services/VerificationTokenService';
import EmailService from '../../../../infrastructure/services/EmailService';
import { verifyApiKey } from '../../../../lib/middleware';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  if (!verifyApiKey(req, res)) return;
  const { username, password, nome, email } = req.body;
  const db = await connectToDatabase();
  const repository = new MongoAuthRepository(db);
  const passwordService = new Argon2PasswordService();
  const tokenService = new VerificationTokenService();
  const registerUseCase = new RegisterUserUseCase({ authRepository: repository, passwordService, tokenService });
  const emailService = new EmailService();
  try {
    const { verificationToken } = await registerUseCase.execute({ username, password, name: nome, email });
    await emailService.sendActivationEmail(email, verificationToken);
    return res.status(200).json({ message: 'Registrado com sucesso. Enviamos um e-mail para ativação da conta' });
  } catch(err) {
    console.error('Erro ao registrar usuário:', err);
    return res.status(400).json({ message: String(err) });
  }
}