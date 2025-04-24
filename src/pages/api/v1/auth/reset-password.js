import { connectToDatabase } from '../../../../config/database';
import ResetPasswordUseCase from '../../../../application/usecases/ResetPasswordUseCase';
import MongoAuthRepository from '../../../../infrastructure/database/MongoAuthRepository';
import Argon2PasswordService from '../../../../infrastructure/services/Argon2PasswordService';
import { verifyApiKey } from '../../../../lib/middleware';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  // No API key required for reset (assuming public endpoint)
  const { token, newPassword } = req.body;
  const db = await connectToDatabase();
  const repository = new MongoAuthRepository(db);
  const passwordService = new Argon2PasswordService();
  const resetUseCase = new ResetPasswordUseCase({ authRepository: repository, passwordService });
  try {
    const result = await resetUseCase.execute({ token, newPassword });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    return res.status(400).json({ message: error.message });
  }
}