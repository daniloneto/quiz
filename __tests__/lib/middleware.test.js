const jwt = require('jsonwebtoken');
const { verifyApiKey, authenticateToken } = require('../../lib/middleware');

describe('lib/middleware', () => {
  let req;
  let res;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };
    process.env.API_KEY = 'test-api-key';
    process.env.JWT_SECRET_KEY = 'test-secret';
  });

  describe('verifyApiKey', () => {
    it('returns true when x-api-key header matches', () => {
      req.headers['x-api-key'] = 'test-api-key';
      const result = verifyApiKey(req, res);
      expect(result).toBe(true);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('returns false and sends 403 when header missing', () => {
      const result = verifyApiKey(req, res);
      expect(result).toBe(false);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Acesso negado' });
    });

    it('returns false and sends 403 when header incorrect', () => {
      req.headers['x-api-key'] = 'wrong-key';
      const result = verifyApiKey(req, res);
      expect(result).toBe(false);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Acesso negado' });
    });
  });

  describe('authenticateToken', () => {
    it('returns false and sends 401 when authorization header missing', () => {
      const result = authenticateToken(req, res);
      expect(result).toBe(false);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token não fornecido' });
    });

    it('returns false and sends 403 when token invalid', () => {
      req.headers['authorization'] = 'Bearer invalidtoken';
      const result = authenticateToken(req, res);
      expect(result).toBe(false);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido ou expirado' });
    });

    it('returns true and sets req.user when token valid', () => {
      const payload = { userId: '12345' };
      const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
      req.headers['authorization'] = `Bearer ${token}`;
      const result = authenticateToken(req, res);
      expect(result).toBe(true);
      expect(req.user).toMatchObject({ userId: '12345' });
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});