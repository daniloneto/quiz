import { ObjectId } from 'mongodb';
import ExamRepository from '../../domain/repositories/ExamRepository';
import { IQuestionParams } from '../../domain/entities/Question';

/**
 * MongoDB implementation of ExamRepository.
 */
class MongoExamRepository extends ExamRepository {
  private db: any;
  private collection: any;
  constructor(db: any) {
    super();
    this.db = db;
    this.collection = this.db.collection('exams');
  }

  async saveExam(examEntity) {
    const doc = {
      title: examEntity.title,
      description: examEntity.description,
      quizzes: examEntity.quizzes,
      createdAt: examEntity.createdAt || new Date(),
    };
    const result = await this.collection.insertOne(doc);
    return result.insertedId.toString();
  }

  async findExams({ page, limit }) {
    const skip = (page - 1) * limit;
    const docs = await this.collection.find({})
      .skip(skip)
      .limit(limit)
      .toArray();
    return docs.map(doc => ({
      id: doc._id.toString(),
      title: doc.title,
      description: doc.description,
      quizzes: doc.quizzes,
      createdAt: doc.createdAt,
    }));
  }
  
  async findAllExams() {
    const docs = await this.collection.find({}).toArray();  
    return docs.map(doc => ({
      id: doc._id.toString(), 
      title: doc.title,
      description: doc.description,
      quizzes: doc.quizzes,
      createdAt: doc.createdAt,
    }));
  }
  



  async countExams() {
    return this.collection.countDocuments();
  }

  async findExamByTitle(title) {
    const doc = await this.collection.findOne({ title });
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      title: doc.title,
      description: doc.description,
      quizzes: doc.quizzes,
      createdAt: doc.createdAt,
    };
  }

  async deleteExam(id) {
    const result = await this.collection.deleteOne({ 
      _id: new ObjectId(id) 
    });
    return result.deletedCount > 0;
  }
  
  /**
   * Find an exam by its ID.
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  async findExamById(id) {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) });
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      title: doc.title,
      description: doc.description,
      quizzes: doc.quizzes || [],
      createdAt: doc.createdAt,
    };
  }

  /**
   * Add a quiz to an existing exam by title.
   * @param {string} title
   * @param {object} quiz
   * @returns {Promise<boolean>}
   */
  async addQuizToExam(title, quiz) {
    const result = await this.collection.updateOne(
      { title },
      { $push: { quizzes: quiz } }
    );
    return result.modifiedCount > 0;
  }
  
  /**
   * Add a question to a specific quiz within an exam.
   */
  async addQuestionToQuiz(examTitle, quizTitle, questionEntity) {
    const exam = await this.collection.findOne({ title: examTitle });
    if (!exam) return false;
    const quizzes = exam.quizzes || [];
    const index = quizzes.findIndex(q => q.title === quizTitle);
    if (index !== -1) {
      const result = await this.collection.updateOne(
        { title: examTitle, [`quizzes.${index}.title`]: quizTitle },
        { $push: { [`quizzes.${index}.questions`]: questionEntity } }
      );
      return result.modifiedCount > 0;
    }
    const result = await this.collection.updateOne(
      { title: examTitle },
      { $push: { quizzes: { title: quizTitle, questions: [questionEntity] } } }
    );
    return result.modifiedCount > 0;
  }

  /**
   * Update a question within a quiz for a given exam.
   */
  async updateQuestionInQuiz(examId, quizIndex, questionIndex, questionEntity) {
    const filter = { _id: new ObjectId(examId) };
    const update = { $set: { [`quizzes.${quizIndex}.questions.${questionIndex}`]: questionEntity } };
    const result = await this.collection.updateOne(filter, update);
    return result.modifiedCount > 0;
  }

  /**
   * Delete a question from a quiz in an exam.
   */
  async deleteQuestionFromQuiz(examId, quizIndex, questionIndex) {
    const exam = await this.collection.findOne({ _id: new ObjectId(examId) });
    if (!exam || !exam.quizzes || !exam.quizzes[quizIndex]) return false;
    const questions = exam.quizzes[quizIndex].questions || [];
    if (questionIndex < 0 || questionIndex >= questions.length) return false;
    questions.splice(questionIndex, 1);
    
    const result = await this.collection.updateOne(
      { 
        _id: new ObjectId(examId), 
        [`quizzes.${quizIndex}.title`]: exam.quizzes[quizIndex].title 
      },
      { 
        $set: { 
          [`quizzes.${quizIndex}.questions`]: questions 
        }      }
    );
    
    return result.modifiedCount > 0;
  }

  async findQuizQuestions(examId: string, quizIndex: number): Promise<IQuestionParams[]> {
    const exam = await this.collection.findOne({ _id: new ObjectId(examId) });

    if (!exam || !exam.quizzes || !exam.quizzes[quizIndex] || !exam.quizzes[quizIndex].questions) {
      // Consider throwing an error if exam or quiz not found, or returning empty if that's acceptable
      console.warn(`Quiz not found for examId: ${examId}, quizIndex: ${quizIndex}`);
      return [];
    }

    const questions = exam.quizzes[quizIndex].questions;

    // Questions are stored as plain objects from IQuestionParams.
    // The 'id' field should be present as it's part of IQuestionParams and set by Question entity.
    return questions.map(q => ({
      id: q.id, // Ensure this 'id' field exists and is correctly populated
      question: q.question,
      options: q.options.map(opt => ({ text: opt.text, correct: opt.correct })),
      questionType: q.questionType,
      answerKey: q.answerKey,
    } as IQuestionParams)); // Cast to IQuestionParams for type safety
  }
}

export default MongoExamRepository;