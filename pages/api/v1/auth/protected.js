import { connectToDatabase } from '../../../../config/database';
import authController from '../../../../controllers/authController';
import { verifyApiKey, authenticateToken } from '../../../../lib/middleware';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  if (!verifyApiKey(req, res)) return;
  if (!authenticateToken(req, res)) return;
  // Attach database if needed
  const db = await connectToDatabase();
  req.app = { locals: { database: db } };
  // Use controller to handle response
  return authController.protectedRoute(req, res);
}