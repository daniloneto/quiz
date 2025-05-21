import { QuestionGenerationService } from '../../../../src/domain/services/QuestionGenerationService';

// Mock the callGpt method
// We have to use a type assertion for the mockImplementation as the private method is not directly accessible.
let callGptMock: jest.SpyInstance;

describe('QuestionGenerationService', () => {
  let service: QuestionGenerationService;

  beforeEach(() => {
    service = new QuestionGenerationService();
    // Mock the private callGpt method before each test
    // Type assertion needed as callGpt is private
    callGptMock = jest.spyOn(service as any, 'callGpt');
  });

  afterEach(() => {
    // Restore the original implementation after each test
    callGptMock.mockRestore();
  });

  describe('generateMultipleChoiceQuestion', () => {
    const topic = 'Calculus';
    const context = 'Fundamental Theorem of Calculus';

    it('should generate a multiple-choice question with a provided correct answer', async () => {
      const correctAnswer = 'Integral';
      const numChoices = 4;
      const mockGptResponse = {
        // Simulate a GPT response structure that the service would parse
        // For this test, the service's placeholder logic directly constructs the question
        // so the mock here is more about observing the call to callGpt
      };
      callGptMock.mockResolvedValue(mockGptResponse); // Mock the GPT call

      const result = await service.generateMultipleChoiceQuestion(topic, context, correctAnswer, numChoices);

      expect(callGptMock).toHaveBeenCalled(); // We expect callGpt to be called internally by the service's placeholder
      const prompt = callGptMock.mock.calls[0][0]; // Get the prompt passed to callGpt
        // Check prompt content (based on current service implementation)
      expect(prompt).toContain(`Generate a multiple-choice question about "${topic}"`);
      expect(prompt).toContain(`context: "${context}"`);
      expect(prompt).toContain(`The correct answer should be about "${correctAnswer}"`);
      expect(prompt).toContain(`Generate ${numChoices - 1} plausible distractors`);      // Check result structure (based on current service's placeholder logic)      expect(result.questionType).toBe('multiple-choice');
      expect(result.question).toBe(`Multiple-choice question about ${topic}?`);
      expect(result.options.length).toBe(numChoices);
      expect(result.options[0].text).toBe(correctAnswer);
      expect(result.options[0].correct).toBe(true);
      expect(result.options.filter(opt => opt.correct).length).toBe(1);
    });

    it('should generate a multiple-choice question when correct answer is not provided', async () => {
      const numChoices = 3;
      // The service's placeholder logic will create a default "Correct Answer (Generated)"
      callGptMock.mockResolvedValue({}); 

      const result = await service.generateMultipleChoiceQuestion(topic, context, undefined, numChoices);
      
      expect(callGptMock).toHaveBeenCalled();
      const prompt = callGptMock.mock.calls[0][0];
      expect(prompt).toContain(`Generate a multiple-choice question about "${topic}"`);
      expect(prompt).not.toContain(`The correct answer should be`); // Correct answer is not in prompt

      expect(result.questionType).toBe('multiple-choice');
      expect(result.options.length).toBe(numChoices);
      expect(result.options.find(opt => opt.correct)).toBeTruthy();
      expect(result.options.filter(opt => opt.correct).length).toBe(1);
      // Placeholder specific check:
      expect(result.options.find(opt => opt.correct)?.text).toBe("Correct Answer (Generated)");
    });
  });

  describe('generateTrueFalseQuestion', () => {
    const topic = 'History';
    const context = 'The French Revolution';

    it('should generate a true/false question', async () => {
      // The service's placeholder logic randomly decides if true or false
      callGptMock.mockResolvedValue({});

      const result = await service.generateTrueFalseQuestion(topic, context);

      expect(callGptMock).toHaveBeenCalled();
      const prompt = callGptMock.mock.calls[0][0];
      expect(prompt).toContain(`Generate a true/false question about "${topic}"`);
      expect(prompt).toContain(`context: "${context}"`);
      
      expect(result.questionType).toBe('true-false');
      expect(result.question).toContain(`This is a true/false statement about ${topic}.`);
      expect(result.options.length).toBe(2);
      expect(result.options.find(opt => opt.text === 'True')).toBeDefined();
      expect(result.options.find(opt => opt.text === 'False')).toBeDefined();
      expect(result.options.filter(opt => opt.correct).length).toBe(1);
    });
  });

  describe('generateShortAnswerQuestion', () => {
    const topic = 'Biology';
    const context = 'Cellular Respiration';

    it('should generate a short-answer question', async () => {
      callGptMock.mockResolvedValue({});

      const result = await service.generateShortAnswerQuestion(topic, context);

      expect(callGptMock).toHaveBeenCalled();
      const prompt = callGptMock.mock.calls[0][0];
      expect(prompt).toContain(`Generate a short-answer question about "${topic}"`);
      expect(prompt).toContain(`context: "${context}"`);

      expect(result.questionType).toBe('short-answer');
      expect(result.question).toBe(`What is the short answer regarding ${topic}?`);
      expect(result.options.length).toBe(0);
      expect(result.answerKey).toBe(`This is the ideal short answer for ${topic}.`);
    });
  });
});
