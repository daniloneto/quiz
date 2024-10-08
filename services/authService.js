const { ObjectId } = require('mongodb');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

class UserError extends Error {
  constructor (message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function registerUser (database, { username, password, nome, email }) {
  const existingUser = await database.collection('users').findOne({ username });
  if (existingUser) {
    throw new UserError('Nome de usuário já em uso.', 400);
  }

  const existingEmail = await database.collection('profile').findOne({ email });
  if (existingEmail) {
    logger.error('E-mail em uso:', email);
    throw new UserError('E-mail em uso.', 400);
  }

  const hashedPassword = await argon2.hash(password);
  const user = { username, password: hashedPassword };

  const userResult = await database.collection('users').insertOne(user);
  const profile = {
    _id: userResult.insertedId,
    nome,
    email,
    pontos: 0,
    nivel: 1,
    data_criacao: new Date(),
    ultimo_login: new Date(),
    ativado: false,
    adm: false
  };

  await database.collection('profile').insertOne(profile);

  const token = jwt.sign({ userId: userResult.insertedId }, process.env.JWT_SECRET_KEY, {
    expiresIn: '1h',
  });

  return { token };
}

async function loginUser (database, { username, password }) {
  const user = await database.collection('users').findOne({ username });
  if (!user) {
    logger.error('Usuário não encontrado:', username);
    throw new UserError('Usuário e/ou senha incorreta.', 401);
  }

  const profile = await database.collection('profile').findOne({ _id: user._id });
  if (!profile.ativado) {
    logger.error('Conta não ativada:', username);
    throw new UserError('Conta não foi ativada ainda, verifique seu e-mail.', 401);
  }

  const isPasswordValid = await argon2.verify(user.password, password);
  if (!isPasswordValid) {
    logger.error('Senha incorreta:', username);    
    throw new UserError('Usuário e/ou senha incorreta', 401);
  }

  await database.collection('profile').updateOne(
    { _id: new ObjectId(user._id) },
    { $set: { ultimo_login: new Date() } }
  );

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: '1h',
  });
  const expirationDate = new Date(Date.now() + 3600000); // 1 hora a partir de agora

  return { token, expiresAt: expirationDate, uid: user._id };
}

async function forgotPassword (database, email) {
  const userProfile = await database.collection('profile').findOne({ email });
  if (!userProfile) {
    logger.error('E-mail não encontrado:', email);
    throw new UserError('E-mail não encontrado.', 404);
  }

  const now = new Date();
  const resetCooldown = 5 * 60 * 1000; // 5 minutos de cooldown

  if (userProfile.lastPasswordResetRequest && now - userProfile.lastPasswordResetRequest < resetCooldown) {
    throw new UserError(`Você já solicitou redefinição de senha. Tente novamente após ${Math.ceil(
      (resetCooldown - (now - userProfile.lastPasswordResetRequest)) / 60000
    )} minutos.`, 429);
  }

  await database.collection('profile').updateOne(
    { _id: userProfile._id },
    { $set: { lastPasswordResetRequest: now } }
  );

  const token = jwt.sign({ userId: userProfile._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: '1h',
  });

  await database.collection('passwordResetTokens').insertOne({
    userId: userProfile._id,
    token: token,
    used: false,
    createdAt: new Date(),
  });

  return { token };
}

async function resetPassword (database, { token, newPassword }) {
  const tokenRecord = await database.collection('passwordResetTokens').findOne({ token });
  if (!tokenRecord || tokenRecord.used) {
    logger.error('Token inválido ou já utilizado:', token);
    throw new UserError('Token inválido ou já utilizado.', 400);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const userId = decoded.userId;

  const userProfile = await database.collection('profile').findOne({ _id: new ObjectId(userId) });
  if (!userProfile) {
    logger.error('Usuário não encontrado:', userId);
    throw new UserError('Usuário não encontrado.', 404);
  }

  const hashedPassword = await argon2.hash(newPassword);
  await database.collection('users').updateOne(
    { _id: new ObjectId(userId) },
    { $set: { password: hashedPassword } }
  );

  await database.collection('passwordResetTokens').updateOne(
    { token },
    { $set: { used: true } }
  );
}
async function confirmEmail (database, token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.userId;

    const userProfile = await database.collection('profile').findOne({ _id: new ObjectId(userId) });
    if (!userProfile) {
      logger.error('Perfil de usuário não encontrado:', userId);
      throw new UserError('Perfil de usuário não encontrado.', 404);
    }

    if (userProfile.ativado) {
      logger.error('Conta já ativada:', userId);
      throw new UserError('Conta já ativada.', 400);
    }

    await database.collection('profile').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { ativado: true } }
    );

    return 'Conta ativada com sucesso.';
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.error('Token inválido ou expirado:', token);
      throw new UserError('Token inválido ou expirado.', 400);
    }
    logger.error('Erro ao confirmar e-mail:', error);
    throw new UserError('Erro ao confirmar e-mail.', 500);
  }
}

module.exports = {    
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  confirmEmail,
  UserError,
};

