const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
require("dotenv").config();
const { authenticateToken, verifyApiKey } = require("./middleware");
const crypto = require("crypto");
const axios = require("axios");
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");
const validator = require("validator");
const { MailerSend, EmailParams, Recipient, Sender } = require("mailersend");
const helmet = require("helmet");

const { cadastro_ativado, erro_ativacao } = require("./htmls");
const { connectToDatabase } = require("./db");

const app = express();
const port = process.env.PORT;
const secretKey = process.env.JWT_SECRET_KEY;
const hmacKey = process.env.HMAC_SECRET_KEY;
const apiKey = process.env.API_KEY;

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("trust proxy", 1);

const loginLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutos
  max: 10, // Limite de 10 requisições por IP
  handler: (req, res) => {
    res.status(429).json({
      message:
        "Você excedeu o limite de requisições. Tente novamente mais tarde.",
    });
  },
});

const speedLimiter = slowDown({
  windowMs: 2 * 60 * 1000, // 2 minutos
  delayAfter: 3, // Começa a desacelerar após 3 requisições
  delayMs: () => 1000, // Adiciona 1000ms de atraso por requisição adicional
});

const v1IndexRouter = require("./routes/v1/index");
const v1BackupRouter = require("./routes/v1/backup");
const v1ExamRouter = require("./routes/v1/exam");
const v1QuizRouter = require("./routes/v1/quiz");

app.use("/api/v1", v1IndexRouter);
app.use("/api/v1", v1BackupRouter);
app.use("/api/v1", v1ExamRouter);
app.use("/api/v1", v1QuizRouter);

function verifyOrigin(req, res, next) {
  const origin = req.headers.origin || req.headers.referer;
  if (!origin || !origin.startsWith(process.env.ORIGIN_URL)) {
    return res.status(403).json({ message: "Não permitido" });
  }
  next();
}

app.post(
  "/proxy-login",
  loginLimiter,
  speedLimiter,
  verifyOrigin,
  async (req, res) => {
    const { username, password } = req.body;

    // Validação e sanitização
    if (
      !validator.isAlphanumeric(username) ||
      !validator.isLength(username, { min: 3, max: 30 })
    ) {
      return res.status(401).json({ message: "Invalid username" });
    }
    if (!validator.isLength(password, { min: 6 })) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const payload = `username=${encodeURIComponent(
      username
    )}&password=${encodeURIComponent(password)}`;
    const hmac = crypto.createHmac("sha256", hmacKey);
    const digest = hmac.update(payload).digest("hex");

    try {
      const response = await axios.post(
        process.env.ORIGIN_URL + "/api/v1/login",
        payload,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "x-api-key": apiKey,
            "x-signature": digest,
          },
        }
      );

      res.status(response.status).json(response.data);
    } catch (error) {
      console.log(error);
      if (error.response) {
        // O servidor respondeu com um status fora do intervalo 2xx
        res.status(error.response.status).json(error.response.data);
      } else if (error.request) {
        // A requisição foi feita mas não houve resposta
        res.status(500).json({ message: "No response received from server" });
      } else {
        // Algo aconteceu ao configurar a requisição que acionou um erro
        res.status(500).json({ message: "Error in setting up the request" });
      }
    }
  }
);

app.get("/confirm-email", async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, secretKey);
    const userId = decoded.userId;

    // Verifica se o perfil do usuário existe
    const userProfile = await app.locals.database
      .collection("profile")
      .findOne({ _id: new ObjectId(userId) });
    if (!userProfile) {
      return res.status(400).send(erro_ativacao);
    }

    // Verifica se o usuário já está ativado
    if (userProfile.ativado) {
      return res.status(400).send(erro_ativacao);
    }

    await app.locals.database
      .collection("profile")
      .updateOne({ _id: new ObjectId(userId) }, { $set: { ativado: true } });

    res.status(200).send(cadastro_ativado);
  } catch (error) {
    console.error("Erro ao confirmar e-mail:", error);
    res.status(400).send(erro_ativacao);
  }
});

app.post("/api/v1/register", async (req, res) => {
  const { username, password, nome, email } = req.body;
  const pontos = 0;
  const nivel = 1;
  const ativado = false;

  try {
    // Verifica se o nome de usuário já existe
    const existingUser = await app.locals.database
      .collection("users")
      .findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Nome de usuário já em uso." });
    }

    // Verifica se o e-mail já existe
    const existingEmail = await app.locals.database
      .collection("profile")
      .findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "E-mail em uso." });
    }

    const hashedPassword = await argon2.hash(password);
    const user = { username, password: hashedPassword };

    const userResult = await app.locals.database
      .collection("users")
      .insertOne(user);

    const profile = {
      _id: userResult.insertedId,
      nome,
      email,
      pontos,
      nivel,
      data_criacao: new Date(),
      ultimo_login: new Date(),
      ativado,
    };

    await app.locals.database.collection("profile").insertOne(profile);

    const token = jwt.sign({ userId: userResult.insertedId }, secretKey, {
      expiresIn: "1h",
    });

    const mailersend = new MailerSend({
      apiKey: process.env.MAILSEND_KEY,
    });
    const sentFrom = new Sender(
      "MS_InzujB@trial-0p7kx4xpqdvl9yjr.mlsender.net",
      "CertQuiz"
    );
    const recipients = [new Recipient(email, nome)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject("CertQuiz - Verificação de e-mail")
      .setHtml(
        `Ative sua conta CertQuiz agora: <a href="${process.env.ORIGIN_URL}/confirm-email?token=${token}">${process.env.ORIGIN_URL}/confirm-email?token=${token}</a>`
      );

    await mailersend.email.send(emailParams);

    res.status(200).json({
      message:
        "Registrado com sucesso. Enviamos um e-mail para ativação da conta",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

function verifySignature(req, res, next) {
  const signature = req.headers["x-signature"];
  const apiKeyHeader = req.headers["x-api-key"];

  if (apiKeyHeader !== apiKey) {
    return res.status(403).json({ message: "Acesso negado" });
  }

  const payload = new URLSearchParams(req.body).toString();
  const hmac = crypto.createHmac("sha256", hmacKey);
  const digest = hmac.update(payload).digest("hex");

  if (signature !== digest) {
    return res.status(403).json({ message: "Assinatura inválida" });
  }

  next();
}

app.post(
  "/api/v1/login",
  loginLimiter,
  speedLimiter,
  express.urlencoded({ extended: true }),
  verifySignature,
  async (req, res) => {
    const { username, password } = req.body;

    if (
      !validator.isAlphanumeric(username) ||
      !validator.isLength(username, { min: 3, max: 30 })
    ) {
      return res.status(401).json({ message: "Invalid username" });
    }
    if (!validator.isLength(password, { min: 6 })) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const user = await app.locals.database
      .collection("users")
      .findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Usuário e/ou senha incorreta." });
    }

    const profile = await app.locals.database
      .collection("profile")
      .findOne({ _id: user._id });
    if (!profile.ativado) {
      return res.status(401).json({
        message: "Conta não foi ativada ainda, verifique seu e-mail.",
      });
    }

    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Usuário e/ou senha incorreta" });
    }

    await app.locals.database
      .collection("profile")
      .updateOne(
        { _id: new ObjectId(user._id) },
        { $set: { ultimo_login: new Date() } }
      );

    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "1h",
    });
    const expirationDate = new Date(Date.now() + 3600000); // 1 hora a partir de agora
    res.status(201).json({ token, expiresAt: expirationDate, uid: user._id });
  }
);

// Rota protegida
app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "Esta é uma rota protegida" });
});

app.get("/api/v1/protected", authenticateToken, (req, res) => {
  res.json({ message: "Esta é uma rota protegida" });
});

const forgotLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 3, // Limite de 3 requisições por IP
  handler: (req, res) => {
    res.status(429).json({
      message:
        "Você excedeu o limite de requisições. Tente novamente mais tarde.",
    });
  },
});
// Rota para solicitar redefinição de senha
app.post("/forgot-password", forgotLimiter, async (req, res) => {
  const { email } = req.body;

  try {
    // Sanitização do e-mail
    const sanitizedEmail = validator.normalizeEmail(email);

    if (!validator.isEmail(sanitizedEmail)) {
      return res.status(400).json({ message: "E-mail inválido." });
    }

    // Verifica se o e-mail existe
    const userProfile = await app.locals.database
      .collection("profile")
      .findOne({ email: sanitizedEmail });
    if (!userProfile) {
      return res.status(400).json({ message: "E-mail não encontrado." });
    }

    // Controle de múltiplas solicitações de redefinição de senha
    const now = new Date();
    const resetCooldown = 5 * 60 * 1000; // 5 minutos de cooldown

    if (
      userProfile.lastPasswordResetRequest &&
      now - userProfile.lastPasswordResetRequest < resetCooldown
    ) {
      return res.status(429).json({
        message: `Você já solicitou redefinição de senha. Tente novamente após ${Math.ceil(
          (resetCooldown - (now - userProfile.lastPasswordResetRequest)) / 60000
        )} minutos.`,
      });
    }

    // Atualiza o campo de última solicitação de redefinição
    await app.locals.database
      .collection("profile")
      .updateOne(
        { _id: userProfile._id },
        { $set: { lastPasswordResetRequest: now } }
      );

    // Gera um token JWT temporário
    const token = jwt.sign({ userId: userProfile._id }, secretKey, {
      expiresIn: "1h", // Token expira em 1 hora
    });

    // Armazena o token no MongoDB com `used: false`
    await app.locals.database.collection("passwordResetTokens").insertOne({
      userId: userProfile._id,
      token: token,
      used: false,
      createdAt: new Date(),
    });

    // Envia o e-mail com o link para redefinição de senha
    const mailersend = new MailerSend({
      apiKey: process.env.MAILSEND_KEY,
    });
    const sentFrom = new Sender(
      "MS_InzujB@trial-0p7kx4xpqdvl9yjr.mlsender.net",
      "CertQuiz"
    );
    const recipients = [new Recipient(sanitizedEmail, userProfile.nome)];
    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject("CertQuiz - Redefinição de senha")
      .setHtml(
        `Clique no link para redefinir sua senha: <a href="${process.env.ORIGIN_URL}/reset-password?token=${token}">Redefinir Senha</a>`
      );

    await mailersend.email.send(emailParams);

    res
      .status(200)
      .json({ message: "E-mail de redefinição de senha enviado." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao processar a solicitação." });
  }
});

// Rota para redefinir a senha
app.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Verifica o token no MongoDB
    const tokenRecord = await app.locals.database
      .collection("passwordResetTokens")
      .findOne({ token });

    // Verifica se o token é válido e não foi usado
    if (!tokenRecord || tokenRecord.used) {
      return res.status(400).json({ message: "Token inválido ou já utilizado." });
    }

    // Verifica se o token expirou
    const decoded = jwt.verify(token, secretKey); // Valida o JWT

    const userId = decoded.userId;

    // Verifica se o usuário existe
    const userProfile = await app.locals.database
      .collection("profile")
      .findOne({ _id: new ObjectId(userId) });
    if (!userProfile) {
      return res.status(400).json({ message: "Usuário não encontrado." });
    }

    // Atualiza a senha do usuário
    const hashedPassword = await argon2.hash(newPassword);
    await app.locals.database
      .collection("users")
      .updateOne({ _id: new ObjectId(userId) }, { $set: { password: hashedPassword } });

    // Marca o token como "usado" no MongoDB
    await app.locals.database
      .collection("passwordResetTokens")
      .updateOne({ token }, { $set: { used: true } });

    res.status(200).json({ message: "Senha redefinida com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Token inválido ou expirado." });
  }
});


connectToDatabase()
  .then((database) => {
    app.locals.database = database;
    app.listen(port, () => {
      console.log(`Servidor rodando em http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Erro ao iniciar o servidor:", error);
  });
