// Only protectedRoute remains after migration
async function protectedRoute (req, res) {
  res.json({ message: 'Esta é uma rota protegida' });
}
module.exports = { protectedRoute };