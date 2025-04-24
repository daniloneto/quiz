import { connectToDatabase } from '../../../../config/database';
import ConfirmEmailUseCase from '../../../../application/usecases/ConfirmEmailUseCase';
import MongoAuthRepository from '../../../../infrastructure/database/MongoAuthRepository';

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
  const repository = new MongoAuthRepository(db);
  const confirmUseCase = new ConfirmEmailUseCase({ authRepository: repository });
  try {
    const { message } = await confirmUseCase.execute({ token });
    return res.status(200).json({ message });
  } catch (error) {
    console.error('Erro ao confirmar e-mail:', error);
    return res.status(400).json({ message: error.message });
  }
}