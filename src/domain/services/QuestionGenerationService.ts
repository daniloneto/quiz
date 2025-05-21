import { IQuestionParams } from '../entities/Question';
import { IOptionParams } from '../entities/Option';
import { v4 as uuidv4 } from 'uuid';

// Import the OpenAI configuration
import { openaiConfig } from '../../config/openaiConfig'; 
// For gemini support
import { geminiConfig } from '../../config/geminiConfig';

interface IGptResponse {
  question: string;
  options?: string[];
  correctAnswerIndex?: number;
  answerKey?: string;
  isTrue?: boolean;
}

export class QuestionGenerationService {
  private modelProvider: 'openai' | 'gemini';

  constructor(modelProvider: 'openai' | 'gemini' = 'openai') {
    this.modelProvider = modelProvider;
  }

  /**
   * Call the GPT model with a prompt and return the parsed response
   * @param prompt The prompt to send to the GPT model
   * @returns Parsed JSON response from GPT
   */
  private async callGpt(prompt: string): Promise<IGptResponse> {
    console.log("Calling GPT with prompt:", prompt);
    
    try {
      if (this.modelProvider === 'openai' && openaiConfig.client) {
        const gptResponse = await openaiConfig.client.chat.completions.create({
          model: openaiConfig.model,
          messages: [
            { role: 'system', content: 'You are a helpful assistant that generates educational quiz questions in JSON format.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' }
        });
          const content = gptResponse.choices[0]?.message.content;
        if (content) {
          return JSON.parse(content);
        }
      } else if (this.modelProvider === 'gemini' && geminiConfig.client) {
        // Get the model instance using the getModel function
        const model = geminiConfig.getModel();
        if (!model) {
          throw new Error("Failed to get Gemini model");
        }
        
        const geminiResponse = await model.generateContent({
          contents: [
            { role: 'user', parts: [{ text: prompt }] }
          ]
        });
        
        const content = geminiResponse.response.text();
        if (content) {
          // Extract JSON from Gemini response (may need to parse text to extract JSON)
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
        }
      }
      
      // Fallback for testing or when API clients aren't configured
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.generatePlaceholderResponse(prompt);
      
    } catch (error) {
      console.error("Error calling GPT:", error);
      return this.generatePlaceholderResponse(prompt);
    }
  }
  
  /**
   * Generate a placeholder response for testing or when API fails
   */
  private generatePlaceholderResponse(prompt: string): IGptResponse {
    if (prompt.includes('multiple-choice')) {
      return {
        question: "This is a placeholder multiple-choice question?",
        options: ["Correct Answer", "Distractor 1", "Distractor 2", "Distractor 3"],
        correctAnswerIndex: 0
      };
    } else if (prompt.includes('true/false')) {
      return {
        question: "This is a placeholder true/false statement.",
        isTrue: Math.random() > 0.5
      };
    } else {
      return {
        question: "This is a placeholder short-answer question?",
        answerKey: "This is the ideal answer."
      };
    }
  }
  
  /**
   * Generate a multiple-choice question
   * @param topic The topic of the question
   * @param context Additional context for the question
   * @param correctAnswer Optional correct answer hint
   * @param numChoices Number of choices (default 4)
   * @returns Generated question
   */
  async generateMultipleChoiceQuestion(topic: string, context: string, correctAnswer?: string, numChoices: number = 4): Promise<IQuestionParams> {
    const prompt = `Generate a multiple-choice question about "${topic}" based on the following context: "${context}".
${correctAnswer ? `The correct answer should be about "${correctAnswer}". ` : ''}
Generate ${numChoices - 1} plausible distractors that are:
- Related to the subject matter to avoid easy guessing
- Clearly incorrect upon careful consideration
- Not obviously wrong or absurd
- Distinct from each other and from the correct answer

Format the output as a JSON object with keys:
- "question": the question text
- "options": an array of ${numChoices} possible answer strings
- "correctAnswerIndex": the index (0-based) of the correct answer in the options array`;

    try {
      const gptResponse = await this.callGpt(prompt);
      
      // Process response into IQuestionParams format
      const options: IOptionParams[] = [];
      
      if (gptResponse.options && gptResponse.correctAnswerIndex !== undefined) {
        gptResponse.options.forEach((optText, index) => {
          options.push({
            text: optText,
            correct: index === gptResponse.correctAnswerIndex
          });
        });
      } else {
        // Fallback if the response format is incorrect
        options.push({ text: correctAnswer ?? "Correct Answer (Generated)", correct: true });
        for (let i = 1; i < numChoices; i++) {
          options.push({ text: `Distractor ${i}`, correct: false });
        }
      }
      
      return {
        id: uuidv4(), // Generate a unique ID for the question
        question: gptResponse.question || `Multiple-choice question about ${topic}?`,
        options: options,
        questionType: "multiple-choice"
      };
    } catch (error) {
      console.error("Error generating multiple-choice question:", error);
      // Fallback response
      const options: IOptionParams[] = [
        { text: correctAnswer ?? "Correct Answer (Generated)", correct: true },
        ...Array(numChoices - 1).fill(0).map((_, i) => ({ 
          text: `Distractor ${i + 1}`, 
          correct: false 
        }))
      ];
      
      return {
        id: uuidv4(),
        question: `This is a multiple-choice question about ${topic}?`,
        options: options,
        questionType: "multiple-choice"
      };
    }
  }
  
  /**
   * Generate a true/false question
   * @param topic The topic of the question
   * @param context Additional context for the question
   * @returns Generated question
   */
  async generateTrueFalseQuestion(topic: string, context: string): Promise<IQuestionParams> {
    const prompt = `Generate a true/false question about "${topic}" based on the following context: "${context}".
The statement should be clearly and unambiguously true or false based on factual information.
Avoid statements that could be interpreted in multiple ways or that depend on specific interpretations.

Format the output as a JSON object with keys:
- "question": the statement to be evaluated as true or false
- "isTrue": a boolean indicating if the statement is true (true) or false (false)`;

    try {
      const gptResponse = await this.callGpt(prompt);
      
      const isTrue = gptResponse.isTrue !== undefined ? gptResponse.isTrue : Math.random() > 0.5;
      
      return {
        id: uuidv4(),
        question: gptResponse.question || `This is a true/false statement about ${topic}.`,
        options: [
          { text: "True", correct: isTrue },
          { text: "False", correct: !isTrue }
        ],
        questionType: "true-false"
      };
    } catch (error) {
      console.error("Error generating true/false question:", error);
      // Fallback
      const isTrue = Math.random() > 0.5;
      return {
        id: uuidv4(),
        question: `This is a true/false statement about ${topic}. (Placeholder)`,
        options: [
          { text: "True", correct: isTrue },
          { text: "False", correct: !isTrue }
        ],
        questionType: "true-false"
      };
    }
  }
  
  /**
   * Generate a short-answer question
   * @param topic The topic of the question
   * @param context Additional context for the question
   * @returns Generated question
   */  async generateShortAnswerQuestion(topic: string, context: string): Promise<IQuestionParams> {
    const prompt = `Generate a short-answer question about "${topic}" based on the following context: "${context}".
The question should:
- Require a brief, concise free-text answer (1-2 sentences maximum)
- Focus on recall, basic explanation, or conceptual understanding
- Have a clear, unambiguous expected answer
- Be suitable for automated or manual grading

Format the output as a JSON object with keys:
- "question": the question text
- "answerKey": the ideal short answer (1-2 sentences)`;

    try {
      const gptResponse = await this.callGpt(prompt);
      
      return {
        id: uuidv4(),
        question: gptResponse.question || `What is the short answer regarding ${topic}?`,
        options: [], // No options for short answer
        questionType: "short-answer",
        answerKey: gptResponse.answerKey || `This is the ideal short answer for ${topic}.`
      };
    } catch (error) {
      console.error("Error generating short-answer question:", error);
      // Fallback
      return {
        id: uuidv4(),
        question: `What is the short answer regarding ${topic}?`,        options: [], // No options for short answer
        questionType: "short-answer",
        answerKey: `This is the ideal short answer for ${topic}.`
      };
    }
  }
}
