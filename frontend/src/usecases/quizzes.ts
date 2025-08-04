import {
  createQuiz as createQuizService,
  fetchQuizzesByExam as fetchQuizzesByExamService,
  saveQuizResult as saveQuizResultService,
  fetchQuizResults as fetchQuizResultsService,
} from 'src/infrastructure/api/quizService';
import {
  addQuestion as addQuestionService,
  updateQuestion as updateQuestionService,
  deleteQuestion as deleteQuestionService,
} from 'src/infrastructure/api/questionService';

export const createQuiz = createQuizService;
export const fetchQuizzesByExam = fetchQuizzesByExamService;
export const saveQuizResult = saveQuizResultService;
export const fetchQuizResults = fetchQuizResultsService;
export const addQuestion = addQuestionService;
export const updateQuestion = updateQuestionService;
export const deleteQuestion = deleteQuestionService;
