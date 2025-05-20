import { connectToDatabase } from '../../../../config/database';
import crawlerController from '../../../../controllers/crawlerController';
import { verifyApiKey, authenticateToken } from '../../../../lib/middleware';
import { crawlerLimiter } from '../../../../lib/rateLimiter';

// Configuração de API para garantir que o body parsing funcione corretamente
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

/**
 * API route handler for web crawling to generate questions
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
    // Rate limit - usando o limitador específico para crawler
  try {
    const key = req.headers['x-api-key'] || req.socket.remoteAddress;
    const { success } = await crawlerLimiter.limit(key);
    if (!success) {
      return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }
  } catch (error) {
    // Em caso de erro no rate limiter, log do erro, mas permitimos a requisição em ambientes de teste
    console.error('Rate limiter error:', error.message);
    if (process.env.NODE_ENV === 'production' && process.env.BYPASS_RATELIMIT !== 'true') {
      return res.status(500).json({ message: 'Internal server error on rate limiting' });
    }
    // Em ambiente de teste ou desenvolvimento, continuamos mesmo com erro no rate limiter
    console.warn('⚠️ Continuando sem rate limiting devido a erro ou modo de teste');
  }
  
  if (!verifyApiKey(req, res)) return;
  if (!authenticateToken(req, res)) return;

  // Validate body
  if (!req.body.urls || !Array.isArray(req.body.urls) || req.body.urls.length === 0) {
    return res.status(400).json({ message: 'URLs must be provided as an array' });
  }
  
  if (!req.body.numQuestions || !req.body.quizTitle || !req.body.examTitle || !req.body.lingua) {
    return res.status(400).json({ message: 'Missing required fields: numQuestions, quizTitle, examTitle, lingua' });
  }

  // Attach database
  const db = await connectToDatabase();
  req.app = { locals: { database: db } };
  
  // Delegate to controller
  return crawlerController.processCrawl(req, res);
}
