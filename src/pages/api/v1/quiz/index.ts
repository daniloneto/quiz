import { connectToDatabase } from '../../../../config/database';
import CreateQuizUseCase from '../../../../application/usecases/CreateQuizUseCase';
import MongoExamRepository from '../../../../infrastructure/database/MongoExamRepository';
import { verifyApiKey, authenticateToken } from '../../../../lib/middleware';
import { apiLimiter } from '../../../../lib/rateLimiter';
import { QuestionGenerationService } from '../../../../domain/services/QuestionGenerationService';
import logger from '../../../../config/logger';

// Utility function to distribute questions according to percentages
function calculateQuestionCounts(params: {
  totalQuestions: number;
  multipleChoicePercentage?: number;
  trueFalsePercentage?: number;
  shortAnswerPercentage?: number;
  multipleChoiceCount?: number;
  trueFalseCount?: number;
  shortAnswerCount?: number;
}) {
  // If specific counts are provided, use them
  if (
    params.multipleChoiceCount !== undefined &&
    params.trueFalseCount !== undefined &&
    params.shortAnswerCount !== undefined
  ) {
    // Validate that counts add up to totalQuestions
    const totalSpecifiedCount = 
      params.multipleChoiceCount + 
      params.trueFalseCount + 
      params.shortAnswerCount;
    
    if (totalSpecifiedCount !== params.totalQuestions) {
      throw new Error(
        `The sum of specified question counts (${totalSpecifiedCount}) does not match the total questions (${params.totalQuestions})`
      );
    }
    
    return {
      multipleChoiceCount: params.multipleChoiceCount,
      trueFalseCount: params.trueFalseCount,
      shortAnswerCount: params.shortAnswerCount
    };
  }
  
  // Otherwise, use percentages
  const multipleChoicePercentage = params.multipleChoicePercentage || 0;
  const trueFalsePercentage = params.trueFalsePercentage || 0;
  const shortAnswerPercentage = params.shortAnswerPercentage || 0;
  
  // Validate percentages
  const totalPercentage = multipleChoicePercentage + trueFalsePercentage + shortAnswerPercentage;
  if (totalPercentage !== 100) {
    throw new Error(
      `Percentages must add up to 100%. Current total: ${totalPercentage}%`
    );
  }
  
  // Calculate counts
  let multipleChoiceCount = Math.floor(params.totalQuestions * (multipleChoicePercentage / 100));
  let trueFalseCount = Math.floor(params.totalQuestions * (trueFalsePercentage / 100));
  let shortAnswerCount = Math.floor(params.totalQuestions * (shortAnswerPercentage / 100));
  
  // Distribute any remaining questions due to rounding
  const distributedTotal = multipleChoiceCount + trueFalseCount + shortAnswerCount;
  const remaining = params.totalQuestions - distributedTotal;
  
  if (remaining > 0) {
    // Add remaining questions to the type with the highest percentage
    if (multipleChoicePercentage >= trueFalsePercentage && multipleChoicePercentage >= shortAnswerPercentage) {
      multipleChoiceCount += remaining;
    } else if (trueFalsePercentage >= multipleChoicePercentage && trueFalsePercentage >= shortAnswerPercentage) {
      trueFalseCount += remaining;
    } else {
      shortAnswerCount += remaining;
    }
  }
  
  return {
    multipleChoiceCount,
    trueFalseCount,
    shortAnswerCount
  };
}

export default async function handler(req, res) {
  // Rate limit
  const key = req.headers['x-api-key'] || req.socket.remoteAddress;
  const { success } = await apiLimiter.limit(key);
  if (!success) {
    return res.status(429).json({ message: 'Too many requests. Please try again later.' });
  }
  if (!verifyApiKey(req, res)) return;
  if (!authenticateToken(req, res)) return;
  
  // Database connection setup
  const db = await connectToDatabase();
  const repository = new MongoExamRepository(db);
  
  if (req.method === 'POST') {
    // Check if this is a standard quiz creation or a mixed question type request
    if (req.body.mixedQuestionTypes) {
      // Handle mixed question types
      try {
        // Validate inputs
        const { examTitle, quizTitle, topic, context, totalQuestions, 
                multipleChoicePercentage, trueFalsePercentage, shortAnswerPercentage,
                multipleChoiceCount, trueFalseCount, shortAnswerCount, numChoices = 4 } = req.body;
        
        // Validate required parameters
        if (!examTitle || !quizTitle || !topic || !context || !totalQuestions) {
          return res.status(400).json({ 
            message: 'Missing required parameters for mixed question types' 
          });
        }
        
        // Calculate question distribution
        const questionCounts = calculateQuestionCounts({
          totalQuestions,
          multipleChoicePercentage,
          trueFalsePercentage,
          shortAnswerPercentage,
          multipleChoiceCount,
          trueFalseCount,
          shortAnswerCount
        });
        
        logger.info(`Generating mixed question quiz: ${examTitle} / ${quizTitle}`, { 
          distribution: questionCounts 
        });
        
        // Create empty quiz
        const createUseCase = new CreateQuizUseCase({ examRepository: repository });
        await createUseCase.execute({ 
          examTitle, 
          quiz: { title: quizTitle, questions: [] } 
        });
        
        // Generate and add questions
        const questionGenerationService = new QuestionGenerationService();
        const questionPromises = [];
        
        // Generate multiple-choice questions
        for (let i = 0; i < questionCounts.multipleChoiceCount; i++) {
          questionPromises.push(
            questionGenerationService.generateMultipleChoiceQuestion(topic, context, undefined, numChoices)
              .then(question => repository.addQuestionToQuiz(examTitle, quizTitle, question))
          );
        }
        
        // Generate true-false questions
        for (let i = 0; i < questionCounts.trueFalseCount; i++) {
          questionPromises.push(
            questionGenerationService.generateTrueFalseQuestion(topic, context)
              .then(question => repository.addQuestionToQuiz(examTitle, quizTitle, question))
          );
        }
        
        // Generate short-answer questions
        for (let i = 0; i < questionCounts.shortAnswerCount; i++) {
          questionPromises.push(
            questionGenerationService.generateShortAnswerQuestion(topic, context)
              .then(question => repository.addQuestionToQuiz(examTitle, quizTitle, question))
          );
        }
        
        // Wait for all questions to be generated and added
        await Promise.all(questionPromises);
        
        return res.status(201).json({ 
          message: 'Quiz with mixed question types created successfully',
          questionDistribution: questionCounts
        });
      } catch (error) {
        logger.error('Error creating quiz with mixed question types:', error);
        return res.status(400).json({ 
          message: error.message || 'Failed to create quiz with mixed question types'
        });
      }
    } else {
      // Standard quiz creation
      const { examTitle, quiz } = req.body;
      const createUseCase = new CreateQuizUseCase({ examRepository: repository });
      try {
        await createUseCase.execute({ examTitle, quiz });
        return res.status(200).json({ message: 'Quiz cadastrado com sucesso' });
      } catch(err) {
        console.error('Erro ao cadastrar o quiz:', String(err));
        if (String(err) === 'Error: Exame não encontrado') {
          return res.status(404).json({ message: String(err) });
        }
        return res.status(400).json({ message: String(err) });
      }
    }
  }
  
  res.setHeader('Allow', ['POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}