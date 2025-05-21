import { connectToDatabase } from '../../../../config/database';
import AddQuestionUseCase from '../../../../application/usecases/AddQuestionUseCase';
import MongoExamRepository from '../../../../infrastructure/database/MongoExamRepository';
// Option and Question are used by other methods (PUT, DELETE), keep them for now.
// IOptionParams and QuestionType will be used for the POST request body.
import { QuestionGenerationService } from '../../../../domain/services/QuestionGenerationService';
import { verifyApiKey, authenticateToken } from '../../../../lib/middleware';
import { apiLimiter } from '../../../../lib/rateLimiter';

export default async function handler(req, res) {
  // Rate limit
  const key = req.headers['x-api-key'] || req.socket.remoteAddress;
  const { success } = await apiLimiter.limit(key);
  if (!success) {
    return res.status(429).json({ message: 'Too many requests. Please try again later.' });
  }
  if (!verifyApiKey(req, res)) return;
  if (!authenticateToken(req, res)) return;
  const db = await connectToDatabase();
  const repository = new MongoExamRepository(db);
  const questionGenerationService = new QuestionGenerationService(); // Assuming default constructor

  switch (req.method) {
    case 'POST': {
      const { 
        examTitle, 
        quizTitle, 
        questionType, 
        topic, 
        context, 
        questionText, 
        options, // Expects IOptionParams[]
        correctAnswer, 
        numChoices 
      } = req.body;

      const useCase = new AddQuestionUseCase({ examRepository: repository, questionGenerationService });
      
      try {
        await useCase.execute({
          examTitle,
          quizTitle,
          questionType,
          topic,
          context,
          questionText,
          options,
          correctAnswer,
          numChoices
        });
        return res.status(201).json({ message: 'Question added successfully.' }); // Changed to 201 for resource creation
      } catch(err) {
        console.error('Error adding question:', err);
        // Improved error message handling, specific messages come from the use case
        return res.status(400).json({ message: err.message || 'Failed to add question.' });
      }
    }
    case 'PUT': {
      // Ensure Option and Question are available if UpdateQuestionUseCase or DeleteQuestionUseCase need them
      // For now, assuming they operate on plain objects or IDs as per current file structure
      const { examId, quizIndex, questionIndex, optionIndex, newValue } = req.body;
      // Potentially import Option and Question from domain entities if needed by use cases directly
      // For now, the use cases seem to handle data transformation or expect simple types
      const UpdateQuestionUseCase = (await import('../../../../application/usecases/UpdateQuestionUseCase')).default;
      const useCase = new UpdateQuestionUseCase({ examRepository: repository });
      try {
        await useCase.execute({ examId, quizIndex, questionIndex, optionIndex, newValue });
        return res.status(200).json({ message: 'Pergunta atualizada com sucesso' });
      } catch(err) {
        console.error('Erro ao atualizar a pergunta:', err);
        const msg = String(err);
        if (msg === 'Exame não encontrado') return res.status(404).json({ message: msg });
        return res.status(400).json({ message: msg });
      }
    }
    case 'DELETE': {
      const { examId, quizIndex, questionIndex } = req.body;
      const DeleteQuestionUseCase = (await import('../../../../application/usecases/DeleteQuestionUseCase')).default;
      const useCase = new DeleteQuestionUseCase({ examRepository: repository });
      try {
        await useCase.execute({ examId, quizIndex, questionIndex });
        return res.status(200).json({ message: 'Pergunta deletada com sucesso' });
      } catch(err) {
        console.error('Erro ao deletar a pergunta:', String(err));
        return res.status(400).json({ message: String(err) });
      }
    }
    default:
      res.setHeader('Allow', ['PUT', 'POST', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}