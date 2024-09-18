const authService = require("../services/authService");
const emailService = require("../services/emailService");
const { validateUsername, validatePassword } = require("../utils/validators");
const validator = require("validator");
const { ObjectId } = require('mongodb');


async function register(req, res) {
  const { username, password, nome, email } = req.body;

  if (!validateUsername(username) || !validatePassword(password)) {
    return res.status(400).json({ message: "Invalid username or password" });
  }

  try {
    const result = await authService.registerUser(req.app.locals.database, {
      username,
      password,
      nome,
      email,
    });
    await emailService.sendActivationEmail(email, result.token);
    res.status(200).json({
      message:
        "Registrado com sucesso. Enviamos um e-mail para ativação da conta",
    });
  } catch (error) {
    if (error instanceof authService.UserError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

async function login(req, res) {
  const { username, password } = req.body;
  if (username && password) {
    if (!validateUsername(username) || !validatePassword(password)) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    try {
      const result = await authService.loginUser(req.app.locals.database, {
        username,
        password,
      });
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof authService.UserError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  }
  else{
    return res.status(401).json({ message: "Invalid username or password." });
  }
}

async function forgotPassword(req, res) {
  const { email } = req.body;

  try {
    const sanitizedEmail = validator.normalizeEmail(email);
    if (!validator.isEmail(sanitizedEmail)) {
      return res.status(400).json({ message: "E-mail inválido." });
    }

    const result = await authService.forgotPassword(
      req.app.locals.database,
      sanitizedEmail
    );
    await emailService.sendResetPasswordEmail(sanitizedEmail, result.token);
    res
      .status(200)
      .json({ message: "E-mail de redefinição de senha enviado." });
  } catch (error) {
    if (error instanceof authService.UserError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

async function resetPassword(req, res) {
  const { token, newPassword } = req.body;

  try {
    await authService.resetPassword(req.app.locals.database, {
      token,
      newPassword,
    });
    res.status(200).json({ message: "Senha redefinida com sucesso." });
  } catch (error) {
    if (error instanceof authService.UserError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

async function confirmEmail(req, res) {
  const { token } = req.query;

  try {
    const result = await authService.confirmEmail(
      req.app.locals.database,
      token
    );
    res.status(200).send(result);
  } catch (error) {
    if (error instanceof authService.UserError) {
      res.status(error.statusCode).send(error.message);
    } else {
      console.error("Erro ao confirmar e-mail:", error);
      res.status(500).send("Erro ao confirmar e-mail");
    }
  }
}

async function protectedRoute(req, res) {
  res.json({ message: "Esta é uma rota protegida" });
}
async function getProfile(req, res) {
  const { id } = req.params;

  try {
    const profile = await req.app.locals.database.collection('profile').findOne(
      { _id: new ObjectId(id) },
      { projection: { _id: 1, nome: 1, email: 1, pontos: 1, nivel: 1, data_criacao: 1 } }
    );

    if (!profile) {
      return res.status(404).json({ message: "Perfil não encontrado" });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
}

module.exports = {  
  register,
  login,
  forgotPassword,
  resetPassword,
  confirmEmail,
  protectedRoute,
  getProfile
};
