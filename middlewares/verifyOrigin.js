function verifyOrigin(req, res, next) {
    const origin = req.headers.origin || req.headers.referer;
    if (!origin || !origin.startsWith(process.env.ORIGIN_URL)) {
      return res.status(403).json({ message: 'Não permitido' });
    }
    next();
  }
  
  module.exports = { verifyOrigin };
  