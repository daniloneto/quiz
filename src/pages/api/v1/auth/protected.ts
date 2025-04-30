import ProtectedUseCase from '../../../../application/usecases/ProtectedUseCase';
import { verifyApiKey, authenticateToken } from '../../../../lib/middleware';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  if (!verifyApiKey(req, res)) return;
  if (!authenticateToken(req, res)) return;
  // Attach database if needed
  // Business logic for protected route
  const protectedUseCase = new ProtectedUseCase();
  const { message } = protectedUseCase.execute();
  return res.status(200).json({ message });
}