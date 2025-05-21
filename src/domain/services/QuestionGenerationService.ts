import { IQuestionParams, QuestionType } from '../entities/Question';
import { IOptionParams } from '../entities/Option';

// Placeholder for OpenAI client configuration
// import OpenAI from 'openai';
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class QuestionGenerationService {

  // TODO: Implement actual GPT interaction
  private async callGpt(prompt: string): Promise<any> {
    console.log("Calling GPT with prompt:", prompt);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    // Placeholder response
    return {
      choices: [{ message: { content: "GPT Response based on prompt" } }]
    };
  }

  async generateMultipleChoiceQuestion(topic: string, context: string, correctAnswer?: string, numChoices: number = 4): Promise<IQuestionParams> {
    const prompt = `Generate a multiple-choice question about "${topic}" based on the following context: "${context}".
${correctAnswer ? `The correct answer should be "${correctAnswer}". ` : ''}
Generate ${numChoices -1} plausible distractors.
Format the output as a JSON object with keys "question", "options" (an array of strings, where the first is the correct answer), and "correctAnswerIndex".`;

    // Placeholder for GPT call
    // const gptResponse = await this.callGpt(prompt);
    // For now, return placeholder data
    console.log(`Generating Multiple Choice Question on topic: ${topic}, with context: ${context}`);
    console.log(`Example prompt: ${prompt}`);

    const options: IOptionParams[] = [
      { text: correctAnswer ?? "Correct Answer (Generated)", correct: true },
      { text: "Distractor 1", correct: false },
      { text: "Distractor 2", correct: false },
      { text: "Distractor 3", correct: false },
    ];
    
    // Ensure the number of options matches numChoices
    while (options.length < numChoices) {
      options.push({ text: `Generated Distractor ${options.length}`, correct: false });
    }
    if (options.length > numChoices) {
        options.splice(numChoices);
        // ensure there is still one correct answer
        if (!options.find(op => op.correct)) {
            options[0].correct = true;
        }
    }


    return {
      question: `This is a multiple-choice question about ${topic}?`,
      options: options.slice(0, numChoices),
      questionType: "multiple-choice",
    };
  }

  async generateTrueFalseQuestion(topic: string, context: string): Promise<IQuestionParams> {
    const prompt = `Generate a true/false question about "${topic}" based on the following context: "${context}".
The statement should be clearly true or false.
Format the output as a JSON object with keys "statement" (the true/false statement) and "isTrue" (a boolean indicating if the statement is true).`;

    // Placeholder for GPT call
    // const gptResponse = await this.callGpt(prompt);
    // For now, return placeholder data
    console.log(`Generating True/False Question on topic: ${topic}, with context: ${context}`);
    console.log(`Example prompt: ${prompt}`);

    const isTrue = Math.random() > 0.5; // Randomly true or false for placeholder
    return {
      question: `This is a true/false statement about ${topic}. (Placeholder: The statement is ${isTrue ? 'true' : 'false'})`,
      options: [
        { text: "True", correct: isTrue },
        { text: "False", correct: !isTrue },
      ],
      questionType: "true-false",
    };
  }

  async generateShortAnswerQuestion(topic: string, context: string): Promise<IQuestionParams> {
    const prompt = `Generate a short-answer question about "${topic}" based on the following context: "${context}".
The question should require a brief, free-text answer.
Format the output as a JSON object with keys "question" and "answerKey" (the ideal short answer).`;

    // Placeholder for GPT call
    // const gptResponse = await this.callGpt(prompt);
    // For now, return placeholder data
    console.log(`Generating Short Answer Question on topic: ${topic}, with context: ${context}`);
    console.log(`Example prompt: ${prompt}`);

    return {
      question: `What is the short answer regarding ${topic}?`,
      options: [], // No options for short answer
      questionType: "short-answer",
      answerKey: `This is the ideal short answer for ${topic}.`,
    };
  }
}
