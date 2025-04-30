import OpenAI from 'openai';
import 'dotenv/config';

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY environment variable is not defined');
  throw new Error('OpenAI API key is required');
}

const configuration = {
  apiKey: process.env.OPENAI_API_KEY,
};

const openai = new OpenAI(configuration);

export default openai;