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
function generateVerificationToken () {
  const characters = 'BCDFGHJKLMNPQRSTVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < 5; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return token;
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
  const user = { username, password: hashedPassword, ativado: false, createdAt: new Date() };

  const userResult = await database.collection('users').insertOne(user);
  
  const verificationToken = generateVerificationToken();

  const profile = {
    _id: userResult.insertedId,
    nome,
    email,
    pontos: 0,
    nivel: 1,
    data_criacao: new Date(),
    ultimo_login: new Date(),
    ativado: false,
    adm: false,
    token: verificationToken,
    createdAt: new Date()
  };

  await database.collection('profile').insertOne(profile);

  return { verificationToken };
}

async function loginUser (database, { username, password, loginType }) {
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
  
  if(loginType === 'admin' && profile.adm === false) {
    logger.error('Usuário não é administrador:', username);
    throw new UserError('Você não tem permissão suficiente:', 401);
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
  const verificationToken = generateVerificationToken();

  await database.collection('profile').updateOne(
    { _id: userProfile._id },
    { $set: { lastPasswordResetRequest: now } }
  );

  await database.collection('passwordResetTokens').insertOne({
    userId: userProfile._id,
    token: verificationToken,
    used: false,
    createdAt: new Date(),
  });

  return { verificationToken };
}

async function resetPassword (database, { token, newPassword }) {
  const tokenRecord = await database.collection('passwordResetTokens').findOne({ token });
  if (!tokenRecord || tokenRecord.used) {    
    logger.error(`Token inválido ou já utilizado::${token}`);
    throw new UserError('Token inválido ou já utilizado.', 400);
  }
  
  const userProfile = await database.collection('profile').findOne({ _id: new ObjectId(tokenRecord.userId) });
  if (!userProfile) {
    logger.error('Usuário não encontrado:', tokenRecord.userId);
    throw new UserError('Usuário não encontrado.', 404);
  }

  const hashedPassword = await argon2.hash(newPassword);
  await database.collection('users').updateOne(
    { _id: new ObjectId(tokenRecord.userId) },
    { $set: { password: hashedPassword } }
  );

  await database.collection('passwordResetTokens').updateOne(
    { token },
    { $set: { used: true } }
  );
}
async function confirmEmail (database, token) {
  try {
    
    const userProfile = await database.collection('profile').findOne({ token: token });
    if (!userProfile) {
      logger.error(`Token não encontrado:${token}`);
      throw new UserError('Token não encontrado', 404);
    }

    if (userProfile.ativado) {
      logger.error('Conta já ativada:', userProfile._id);
      throw new UserError('Conta já ativada.', 400);
    }

    await database.collection('profile').updateOne(
      { _id: new ObjectId(userProfile._id) },
      { $set: { ativado: true, token: '' } }
    );
    await database.collection('users').updateOne(
      { _id: new ObjectId(userProfile._id) },
      { $set: { ativado: true, token: '' } }
    );
    
    return 'Conta ativada com sucesso.';
  } catch (error) {    
    logger.error('Erro ao confirmar e-mail:', error);
    throw new UserError(error, 500);
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

