import { connectToDatabase } from '../../../../config/database';
import SaveQuizResultUseCase from '../../../../application/usecases/SaveQuizResultUseCase';
import MongoQuizResultRepository from '../../../../infrastructure/database/MongoQuizResultRepository';
import MongoExamRepository from '../../../../infrastructure/database/MongoExamRepository'; // Import ExamRepository implementation
import { verifyApiKey, authenticateToken } from '../../../../lib/middleware';
// UserAnswer type is not directly used here but defines the structure of req.body.answers
// import { UserAnswer } from '../../../../domain/entities/UserAnswer'; 

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  if (!verifyApiKey(req, res)) return;
  if (!authenticateToken(req, res)) return;

  // Updated request body destructuring
  const { userId, examId, quizIndex, answers } = req.body; 
  
  if (!userId || !examId || quizIndex === undefined || !answers) {
    return res.status(400).json({ message: 'User ID, Exam ID, Quiz Index, and Answers are required.' });
  }

  const db = await connectToDatabase();
  const quizResultRepo = new MongoQuizResultRepository(db);
  const examRepo = new MongoExamRepository(db); // Instantiate ExamRepository

  // Updated UseCase instantiation
  const saveUseCase = new SaveQuizResultUseCase({ 
    quizResultRepository: quizResultRepo,
    examRepository: examRepo 
  });

  try {
    // Updated execute call
    const { upserted, resultId } = await saveUseCase.execute({ userId, examId, quizIndex, answers });
    
    if (upserted) {
      return res.status(201).json({ message: 'Quiz result saved successfully.', resultId });
    }
    return res.status(200).json({ message: 'Quiz result updated successfully.' });
  } catch(err) {
    console.error('Error saving quiz result:', err);
    return res.status(400).json({ message: err.message || 'Failed to save quiz result.' });
  }
}