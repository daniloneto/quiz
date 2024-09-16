const authService = require('../services/authService');
const emailService = require('../services/emailService');
const { validateUsername, validatePassword } = require('../utils/validators');

async function proxyLogin(req, res) {
  const { username, password } = req.body;

  if (!validateUsername(username) || !validatePassword(password)) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  try {
    const response = await authService.proxyLogin(username, password);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function register(req, res) {
  const { username, password, nome, email } = req.body;

  if (!validateUsername(username) || !validatePassword(password)) {
    return res.status(400).json({ message: 'Invalid username or password' });
  }

  try {
    const result = await authService.registerUser(req.app.locals.database, { username, password, nome, email });
    await emailService.sendActivationEmail(email, result.token);
    res.status(200).json({ message: 'Registrado com sucesso. Enviamos um e-mail para ativação da conta' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function login(req, res) {
  const { username, password } = req.body;

  if (!validateUsername(username) || !validatePassword(password)) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  try {
    const result = await authService.loginUser(req.app.locals.database, { username, password });
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function forgotPassword(req, res) {
  const { email } = req.body;

  try {
    const sanitizedEmail = validator.normalizeEmail(email);
    if (!validator.isEmail(sanitizedEmail)) {
      return res.status(400).json({ message: 'E-mail inválido.' });
    }

    const result = await authService.forgotPassword(req.app.locals.database, sanitizedEmail);
    await emailService.sendResetPasswordEmail(sanitizedEmail, result.token);
    res.status(200).json({ message: 'E-mail de redefinição de senha enviado.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao processar a solicitação.' });
  }
}

async function resetPassword(req, res) {
  const { token, newPassword } = req.body;

  try {
    await authService.resetPassword(req.app.locals.database, { token, newPassword });
    res.status(200).json({ message: 'Senha redefinida com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Token inválido ou expirado.' });
  }
}

module.exports = {
  proxyLogin,
  register,
  login,
  forgotPassword,
  resetPassword,
};
