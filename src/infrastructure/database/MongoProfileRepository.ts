import { ObjectId } from 'mongodb';
import ProfileRepository from '../../domain/repositories/ProfileRepository';
import Profile from '../../domain/entities/Profile';
import Level from '../../domain/entities/Level';

/**
 * MongoDB implementation of ProfileRepository.
 */
class MongoProfileRepository extends ProfileRepository {
  private db: any;
  constructor(db: any) {
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

  async updatePointsAndLevel(userId: string, points: number, level: number): Promise<boolean> {
    const result = await this.db.collection('profile').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { pontos: points, nivel: level } }
    );
    return result.modifiedCount > 0;
  }
}

export default MongoProfileRepository;