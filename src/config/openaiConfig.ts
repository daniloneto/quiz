import OpenAI from 'openai';
import 'dotenv/config';
import logger from './logger';

// Default to GPT-3.5 Turbo for cost effectiveness, but can be overridden with env var
const defaultModel = 'gpt-3.5-turbo';

interface OpenAIConfig {
  client: OpenAI | null;
  model: string;
  apiKey: string | null;
}

// Initialize with null values
const openaiConfig: OpenAIConfig = {
  client: null,
  model: process.env.OPENAI_MODEL || defaultModel,
  apiKey: null
};

// Setup OpenAI client if API key is available
try {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (apiKey) {
    openaiConfig.apiKey = apiKey;
    openaiConfig.client = new OpenAI({ apiKey });
    logger.info('OpenAI client initialized successfully');
  } else {
    logger.warn('OPENAI_API_KEY environment variable is not defined, OpenAI features will be unavailable');
  }
} catch (error) {
  logger.error('Failed to initialize OpenAI client:', error);
}

export { openaiConfig };