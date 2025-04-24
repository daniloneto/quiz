import { connectToDatabase } from '../../../../config/database';
import LoginUserUseCase from '../../../../application/usecases/LoginUserUseCase';
import MongoAuthRepository from '../../../../infrastructure/database/MongoAuthRepository';
import Argon2PasswordService from '../../../../infrastructure/services/Argon2PasswordService';
import JwtService from '../../../../infrastructure/services/JwtService';
import { verifyApiKey } from '../../../../lib/middleware';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  if (!verifyApiKey(req, res)) return;
  const { username, password, loginType } = req.body;
  const db = await connectToDatabase();
  const repository = new MongoAuthRepository(db);
  const passwordService = new Argon2PasswordService();
  const jwtService = new JwtService();
  const loginUseCase = new LoginUserUseCase({ authRepository: repository, passwordService, jwtService });
  try {
    const result = await loginUseCase.execute({ username, password, loginType });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erro ao logar usuário:', error);
    return res.status(401).json({ message: error.message });
  }
}