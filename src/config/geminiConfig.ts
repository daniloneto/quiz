import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';
import logger from './logger';

interface GeminiConfig {
  client: GoogleGenerativeAI | null;
  model: string;
  apiKey: string | null;
  getModel: () => any;
}

// Default model for Gemini
const defaultModel = "gemini-1.5-flash-latest";

// Initialize with null values
const geminiConfig: GeminiConfig = {
  client: null,
  model: process.env.GEMINI_MODEL || defaultModel,
  apiKey: null,
  getModel: () => null
};

// Setup Gemini client if API key is available
try {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (apiKey) {
    geminiConfig.apiKey = apiKey;
    geminiConfig.client = new GoogleGenerativeAI(apiKey);
    geminiConfig.getModel = () => geminiConfig.client!.getGenerativeModel({ 
      model: geminiConfig.model 
    });
    logger.info('Gemini client initialized successfully');
  } else {
    logger.warn('GEMINI_API_KEY environment variable is not defined, Gemini features will be unavailable');
  }
} catch (error) {
  logger.error('Failed to initialize Gemini client:', error);
}

// Legacy export for backward compatibility
export const geminiModel = geminiConfig.client ? 
  geminiConfig.client.getGenerativeModel({ model: geminiConfig.model }) : 
  null;

export { geminiConfig };
