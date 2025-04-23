import jwt from 'jsonwebtoken';

// Verifies the presence of the API key in the 'x-api-key' header
export function verifyApiKey (req, res) {
  const apiKeyHeader = req.headers['x-api-key'];
  if (!apiKeyHeader || apiKeyHeader !== process.env.API_KEY) {
    res.status(403).json({ message: 'Acesso negado' });
    return false;
  }
  return true;
}

// Verifies JWT bearer token in 'authorization' header
export function authenticateToken (req, res) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    res.status(401).json({ message: 'Token não fornecido' });
    return false;
  }
  const token = authHeader.replace(/^Bearer\s+/i, '');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    return true;
  } catch (err) {
    res.status(403).json({ message: 'Token inválido ou expirado' });
    return false;
  }
}