const OpenAIApi = require('openai');
require('dotenv').config();

const configuration = {
  apiKey: process.env.OPENAI_API_KEY,
};

const openai = new OpenAIApi(configuration);

module.exports = openai;