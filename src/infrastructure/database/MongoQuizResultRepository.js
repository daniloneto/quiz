import { ObjectId } from 'mongodb';
import QuizResultRepository from '../../domain/repositories/QuizResultRepository';

/**
 * MongoDB implementation of QuizResultRepository.
 */
class MongoQuizResultRepository extends QuizResultRepository {
  constructor(db) {
    super();
    this.db = db;
    this.collection = this.db.collection('quizResults');
  }

  async saveQuizResult({ userId, examId, quizIndex, correctAnswers, totalQuestions }) {
    const filter = {
      userId: new ObjectId(userId),
      examId: new ObjectId(examId)
    };
    
    const now = new Date();
    const update = {
      $set: {
        [`quizzes.${quizIndex}.quizIndex`]: quizIndex
      },
      $push: {
        [`quizzes.${quizIndex}.answers`]: {
          correctAnswers,
          totalQuestions,
          date: now
        }
      }
    };
    
    const options = { upsert: true };
    
    const result = await this.collection.updateOne(filter, update, options);
    
    return {
      upserted: result.upsertedCount > 0,
      resultId: result.upsertedCount > 0 ? result.upsertedId._id.toString() : null
    };
  }

  async findResultsByUser(userId) {
    const docs = await this.collection.find({ 
      userId: new ObjectId(userId) 
    }).toArray();
    
    return docs.map(doc => ({
      userId: doc.userId.toString(),
      examId: doc.examId.toString(),
      quizzes: doc.quizzes
    }));
  }
}

export default MongoQuizResultRepository;