const { ObjectId } = require('mongodb');
const ProfileRepository = require('../../domain/repositories/ProfileRepository');
const Profile = require('../../domain/entities/Profile');
const Level = require('../../domain/entities/Level');

/**
 * MongoDB implementation of ProfileRepository.
 */
class MongoProfileRepository extends ProfileRepository {
  constructor(db) {
    super();
    this.db = db;
  }

  async findById(id) {
    const doc = await this.db.collection('profile').findOne({ _id: new ObjectId(id) });
    if (!doc) {
      return null;
    }
    return new Profile({
      id: doc._id.toString(),
      name: doc.nome,
      email: doc.email,
      points: doc.pontos,
      level: doc.nivel,
      createdAt: doc.data_criacao,
      lastLogin: doc.ultimo_login,
      activated: doc.ativado,
      admin: doc.adm,
      token: doc.token
    });
  }

  async getLevels() {
    const docs = await this.db.collection('levels').find().sort({ pontos: 1 }).toArray();
    return docs.map(doc => new Level({
      level: doc.nivel,
      minPoints: doc.pontos,
      maxPoints: doc.limiteSuperior
    }));
  }

  async updatePointsAndLevel(userId, points, level) {
    await this.db.collection('profile').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { pontos: points, nivel: level } }
    );
  }
}

module.exports = MongoProfileRepository;