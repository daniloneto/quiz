import jwt from 'jsonwebtoken';

/**
 * Handles CORS for API endpoints
 */
export function handleCors(req: any, res: any): boolean {
  const allowedOrigins = [
    'http://localhost:5174', // Vite dev server
    'http://localhost:3000', // Next.js dev server
    'http://127.0.0.1:5174',
    'http://127.0.0.1:3000',
  ];

  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-api-key');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return false; // Don't continue processing
  }
  
  return true; // Continue processing
}

/**
 * Verifies the presence of the API key in the 'x-api-key' header.
 */
export function verifyApiKey(req: any, res: any): boolean {
  const apiKeyHeader = req.headers['x-api-key'];
  if (!apiKeyHeader || apiKeyHeader !== process.env.API_KEY) {
    res.status(403).json({ message: 'Acesso negado' });
    return false;
  }
  return true;
}


/**
 * Verifies JWT bearer token in 'authorization' header.
 */
export function authenticateToken(req: any, res: any): boolean {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    res.status(401).json({ message: 'Token não fornecido' });
    return false;
  }
  const token = authHeader.replace(/^Bearer\s+/i, '');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
    req.user = decoded;
    return true;
  } catch (err) {
    res.status(403).json({ message: 'Token inválido ou expirado' });
    return false;
  }
}