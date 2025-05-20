import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY environment variable is not defined');
  throw new Error('Gemini API key is required');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest"});
