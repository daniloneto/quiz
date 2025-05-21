import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'username is required'),
  password: z.string().min(1, 'password is required'),
  loginType: z.string().min(1, 'loginType is required'),
});

export const registerSchema = z.object({
  username: z.string().min(1, 'username is required'),
  password: z.string().min(6, 'password must be at least 6 characters'),
  nome: z.string().min(1, 'name is required'),
  email: z.string().email('invalid email'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('invalid email'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'token is required'),
  newPassword: z.string().min(6, 'password must be at least 6 characters'),
});

export const confirmEmailSchema = z.object({
  token: z.string().min(1, 'token is required'),
});

// Question validators
export const questionTypeEnum = z.enum(['multiple-choice', 'true-false', 'short-answer']);

// Schema for direct question input
export const directQuestionSchema = z.object({
  examTitle: z.string().min(1, 'exam title is required'),
  quizTitle: z.string().min(1, 'quiz title is required'),
  questionType: questionTypeEnum,
  questionText: z.string().min(3, 'question text is required'),
  options: z.array(
    z.object({
      text: z.string().min(1, 'option text is required'),
      correct: z.boolean().optional(),
    })
  ).optional(),
  correctAnswer: z.string().optional(),
});

// Schema for AI-generated question input
export const aiGeneratedQuestionSchema = z.object({
  examTitle: z.string().min(1, 'exam title is required'),
  quizTitle: z.string().min(1, 'quiz title is required'),
  questionType: questionTypeEnum,
  topic: z.string().min(1, 'topic is required'),
  context: z.string().min(1, 'context is required'),
  correctAnswer: z.string().optional(),
  numChoices: z.number().min(2).max(6).optional(),
});

// Schema for quiz question mix configuration
export const quizQuestionMixSchema = z.object({
  totalQuestions: z.number().min(1, 'at least 1 question is required'),
  multipleChoicePercentage: z.number().min(0).max(100).optional(),
  trueFalsePercentage: z.number().min(0).max(100).optional(),
  shortAnswerPercentage: z.number().min(0).max(100).optional(),
  multipleChoiceCount: z.number().min(0).optional(),
  trueFalseCount: z.number().min(0).optional(),
  shortAnswerCount: z.number().min(0).optional(),
});

// Quiz question mix schema for automating mixed question type creation
export const automatedQuizQuestionMixSchema = z.object({
  examTitle: z.string().min(1, 'exam title is required'),
  quizTitle: z.string().min(1, 'quiz title is required'),
  topic: z.string().min(1, 'topic is required'),
  context: z.string().min(1, 'context is required'),
  totalQuestions: z.number().min(1, 'at least 1 question is required'),
  mixedQuestionTypes: z.boolean().default(true),
  // Percentage distribution (optional)
  multipleChoicePercentage: z.number().min(0).max(100).optional(),
  trueFalsePercentage: z.number().min(0).max(100).optional(),
  shortAnswerPercentage: z.number().min(0).max(100).optional(),
  // Specific counts (optional alternative)
  multipleChoiceCount: z.number().min(0).optional(),
  trueFalseCount: z.number().min(0).optional(),
  shortAnswerCount: z.number().min(0).optional(),
  // For MCQs
  numChoices: z.number().min(2).max(6).optional().default(4),
});