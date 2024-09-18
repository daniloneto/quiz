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

// Função para buscar os níveis do banco de dados
async function buscarNiveis(database) {
  return await database.collection('levels').find().sort({ pontos: 1 }).toArray();
}

// Função para calcular o nível baseado nos pontos e níveis do banco de dados
function calcularNivel(pontos, niveis) {
  for (let i = niveis.length - 1; i >= 0; i--) {
      if (pontos >= niveis[i].pontos) {
          return niveis[i].nivel;
      }
  }
  return 1;
}

// Função para atualizar pontos e nível do usuário
async function atualizarPontos(req, res) {
  const { userId, pontos } = req.body;

  try {
      const database = req.app.locals.database;

      // Buscar o perfil do usuário
      const userProfile = await database.collection('profile').findOne({ _id: new ObjectId(userId) });
      if (!userProfile) {
          return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Buscar os níveis do banco de dados
      const niveis = await buscarNiveis(database);

      // Somar os pontos novos aos pontos existentes
      const pontosTotais = userProfile.pontos + pontos;
      const nivel = calcularNivel(pontosTotais, niveis);

      // Atualizar pontos e nível no banco de dados
      await database.collection('profile').updateOne(
          { _id: new ObjectId(userId) },
          { $set: { pontos: pontosTotais, nivel: nivel } }
      );

      res.status(200).send({ success: true, nivel: nivel });
  } catch (error) {
      res.status(500).send({ success: false, message: error.message });
  }
}

module.exports = {  
  register,
  login,
  forgotPassword,
  resetPassword,
  confirmEmail,
  protectedRoute,
  getProfile,
  atualizarPontos
};
