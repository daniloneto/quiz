const { ObjectId } = require('mongodb');
const AuthRepository = require('../../domain/repositories/AuthRepository');

/**
 * MongoDB implementation of AuthRepository.
 */
class MongoAuthRepository extends AuthRepository {
  constructor(db) {
    super();
    this.db = db;
  }

  async findUserByUsername(username) {
    return this.db.collection('users').findOne({ username });
  }

  async findProfileByEmail(email) {
    return this.db.collection('profile').findOne({ email });
  }

  async saveUser(userEntity) {
    const result = await this.db.collection('users').insertOne({
      username: userEntity.username,
      password: userEntity.passwordHash,
      ativado: false,
      createdAt: new Date(),
    });
    return result.insertedId;
  }

  async saveProfile(profileEntity) {
    await this.db.collection('profile').insertOne({
      _id: new ObjectId(profileEntity.id),
      nome: profileEntity.name,
      email: profileEntity.email,
      pontos: profileEntity.points || 0,
      nivel: profileEntity.level || 1,
      data_criacao: profileEntity.createdAt || new Date(),
      ultimo_login: profileEntity.lastLogin || new Date(),
      ativado: profileEntity.activated || false,
      adm: profileEntity.admin || false,
      token: profileEntity.token || '',
      createdAt: profileEntity.createdAt || new Date(),
    });
  }

  async findProfileById(id) {
    return this.db.collection('profile').findOne({ _id: new ObjectId(id) });
  }

  async findProfileByToken(token) {
    return this.db.collection('profile').findOne({ token });
  }

  async savePasswordResetToken({ userId, token, used, createdAt }) {
    await this.db.collection('passwordResetTokens').insertOne({
      userId: new ObjectId(userId),
      token,
      used,
      createdAt,
    });
  }

  async findPasswordResetToken(token) {
    return this.db.collection('passwordResetTokens').findOne({ token });
  }

  async markPasswordResetTokenUsed(token) {
    await this.db.collection('passwordResetTokens').updateOne(
      { token },
      { $set: { used: true } }
    );
  }

  async updateLastLogin(userId, timestamp) {
    await this.db.collection('profile').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { ultimo_login: timestamp } }
    );
  }

  async updatePasswordResetRequest(userId, timestamp) {
    await this.db.collection('profile').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { lastPasswordResetRequest: timestamp } }
    );
  }

  async activateUser(userId) {
    await this.db.collection('profile').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { ativado: true, token: '' } }
    );
    await this.db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { ativado: true } }
    );
  }

  async updateUserPassword(userId, hashedPassword) {
    await this.db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password: hashedPassword } }
    );
  }
}

module.exports = MongoAuthRepository;