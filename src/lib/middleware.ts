import jwt from 'jsonwebtoken';

/**
 * Handles CORS headers and preflight requests
 * @param req Request object
 * @param res Response object
 * @returns true if request was handled (OPTIONS), false to continue processing
 */
export function handleCors(req: any, res: any): boolean {
  // Lista de origens permitidas
  const allowedOrigins = [
    'http://localhost:9000',
    'http://frontend:9000',
    process.env.ORIGIN_URL
  ].filter(Boolean);
  
  const origin = req.headers.origin;
  
  // Se a origem está na lista permitida ou em desenvolvimento, permite
  if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true; // Indicates that the request was handled
  }
  return false; // Indicates that the request should continue processing
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