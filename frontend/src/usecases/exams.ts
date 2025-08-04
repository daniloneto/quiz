import {
  fetchExams as fetchExamsService,
  createExam as createExamService,
  deleteExam as deleteExamService,
  fetchExamQuiz as fetchExamQuizService,
} from 'src/infrastructure/api/examService';

export const fetchExams = fetchExamsService;
export const createExam = createExamService;
export const deleteExam = deleteExamService;
export const fetchExamQuiz = fetchExamQuizService;
