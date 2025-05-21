import ExamRepository from '../../domain/repositories/ExamRepository';
import { QuestionGenerationService } from '../../domain/services/QuestionGenerationService';
import { IQuestionParams, QuestionType } from '../../domain/entities/Question';
import { IOptionParams } from '../../domain/entities/Option';

interface AddQuestionUseCaseParams {
  examRepository: ExamRepository;
  questionGenerationService: QuestionGenerationService;
}

interface ExecuteParams {
  examTitle: string;
  quizTitle: string;
  questionType: QuestionType;
  topic?: string;
  context?: string;
  questionText?: string;
  options?: IOptionParams[];
  correctAnswer?: string; // For AI gen: correct answer hint. For direct: the correct option text or short answer.
  numChoices?: number; // For AI-generated MCQs
}

/**
 * Use case for adding a question to a quiz within an exam.
 * Can generate questions using AI or accept directly defined questions.
 */
class AddQuestionUseCase {
  private examRepository: ExamRepository;
  private questionGenerationService: QuestionGenerationService;

  constructor({ examRepository, questionGenerationService }: AddQuestionUseCaseParams) {
    this.examRepository = examRepository;
    this.questionGenerationService = questionGenerationService;
  }

  /**
   * Execute adding a question.
   */
  async execute(params: ExecuteParams): Promise<void> {
    let questionParams: IQuestionParams;

    if (params.topic && params.context && !params.questionText) {
      // AI Generation Path
      switch (params.questionType) {
        case "multiple-choice":
          questionParams = await this.questionGenerationService.generateMultipleChoiceQuestion(
            params.topic,
            params.context,
            params.correctAnswer, // Optional: hint for AI
            params.numChoices
          );
          break;
        case "true-false":
          questionParams = await this.questionGenerationService.generateTrueFalseQuestion(
            params.topic,
            params.context
          );
          break;
        case "short-answer":
          questionParams = await this.questionGenerationService.generateShortAnswerQuestion(
            params.topic,
            params.context
          );
          break;
        default:
          throw new Error(`Unsupported question type for AI generation: ${params.questionType}`);
      }
    } else if (params.questionText) {
      // Direct Input Path
      if (!params.options && params.questionType === "multiple-choice") {
        throw new Error("Options are required for multiple-choice questions when providing question text directly.");
      }
      if (!params.correctAnswer && (params.questionType === "short-answer" || params.questionType === "true-false")) {
        throw new Error("Correct answer is required for true-false or short-answer questions when providing question text directly.");
      }


      let finalOptions: IOptionParams[] = params.options || [];
      if (params.questionType === "true-false") {
        finalOptions = [
          { text: "True", correct: params.correctAnswer === "True" },
          { text: "False", correct: params.correctAnswer === "False" },
        ];
      } else if (params.questionType === "multiple-choice" && params.correctAnswer) {
        // Ensure the provided correctAnswer is marked in options
        finalOptions = finalOptions.map(opt => ({
          ...opt,
          correct: opt.text === params.correctAnswer,
        }));
        if (!finalOptions.some(opt => opt.correct)) {
            throw new Error("The provided correctAnswer text does not match any of the provided options for multiple-choice question.");
        }
      }


      questionParams = {
        question: params.questionText,
        options: finalOptions,
        questionType: params.questionType,
        answerKey: params.questionType === "short-answer" ? params.correctAnswer : undefined,
      };
    } else {
      throw new Error("Invalid parameters: Provide topic and context for AI generation, or questionText for direct input.");
    }

    const added = await this.examRepository.addQuestionToQuiz(params.examTitle, params.quizTitle, questionParams);
    if (!added) {
      throw new Error('Failed to add the question to the quiz.');
    }
  }
}

export default AddQuestionUseCase;