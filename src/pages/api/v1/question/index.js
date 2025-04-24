import { connectToDatabase } from '../../../../config/database';
import AddQuestionUseCase from '../../../../application/usecases/AddQuestionUseCase';
import UpdateQuestionUseCase from '../../../../application/usecases/UpdateQuestionUseCase';
import DeleteQuestionUseCase from '../../../../application/usecases/DeleteQuestionUseCase';
import MongoExamRepository from '../../../../infrastructure/database/MongoExamRepository';
import Option from '../../../../domain/entities/Option';
import Question from '../../../../domain/entities/Question';
import { verifyApiKey, authenticateToken } from '../../../../lib/middleware';

export default async function handler(req, res) {
  if (!verifyApiKey(req, res)) return;
  if (!authenticateToken(req, res)) return;
  const db = await connectToDatabase();
  const repository = new MongoExamRepository(db);
  switch (req.method) {
    case 'POST': {
      const { exam, quiz, question: questionText, optionA, optionB, optionC, optionD, correctOption } = req.body;
      const options = [
        new Option({ text: optionA, correct: correctOption === 'A' }),
        new Option({ text: optionB, correct: correctOption === 'B' }),
        new Option({ text: optionC, correct: correctOption === 'C' }),
        new Option({ text: optionD, correct: correctOption === 'D' })
      ];
      const questionEntity = new Question({ question: questionText, options });
      const useCase = new AddQuestionUseCase({ examRepository: repository });
      try {
        await useCase.execute({ examTitle: exam, quizTitle: quiz, questionEntity });
        return res.status(200).json({ message: 'Pergunta adicionada com sucesso' });
      } catch (error) {
        console.error('Erro ao adicionar a pergunta:', error);
        const status = error.message === 'Falha ao adicionar a pergunta.' ? 400 : 404;
        return res.status(status).json({ message: error.message });
      }
    }
    case 'PUT': {
      const { examId, quizIndex, questionIndex, optionIndex, newValue } = req.body;
      const useCase = new UpdateQuestionUseCase({ examRepository: repository });
      try {
        await useCase.execute({ examId, quizIndex, questionIndex, optionIndex, newValue });
        return res.status(200).json({ message: 'Pergunta atualizada com sucesso' });
      } catch (error) {
        console.error('Erro ao atualizar a pergunta:', error);
        const msg = error.message;
        if (msg === 'Exame não encontrado') return res.status(404).json({ message: msg });
        return res.status(400).json({ message: msg });
      }
    }
    case 'DELETE': {
      const { examId, quizIndex, questionIndex } = req.body;
      const useCase = new DeleteQuestionUseCase({ examRepository: repository });
      try {
        await useCase.execute({ examId, quizIndex, questionIndex });
        return res.status(200).json({ message: 'Pergunta deletada com sucesso' });
      } catch (error) {
        console.error('Erro ao deletar a pergunta:', error);
        return res.status(400).json({ message: error.message });
      }
    }
    default:
      res.setHeader('Allow', ['PUT', 'POST', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}