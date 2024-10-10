const openai = require('../config/openaiConfig');
const logger = require('../config/logger');

const TOKEN_LIMIT = 3000;  // Aproximadamente 3000 tokens para cada requisição

// Função para dividir o conteúdo em blocos menores, respeitando o limite de tokens
const splitContent = (content, maxTokens = TOKEN_LIMIT) => {  
  const chunks = [];
  let currentChunk = '';
  content.split(/\s+/).forEach(word => {
    // Aproximadamente 1 token = 4 caracteres, então maxTokens * 4 para calcular o tamanho máximo
    if ((currentChunk.length + word.length + 1) > (maxTokens * 4)) {
      chunks.push(currentChunk);
      currentChunk = word;
    } else {
      currentChunk += ` ${word}`;
    }
  });

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
};

const processUpload = async (req, res) => {     
  const numQuestions = req.body.numQuestions;
  const quizIndex = req.body.quizIndex; 
  const examTitle = req.body.examTitle; 
  
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  if(numQuestions < 1 || numQuestions > 20){
    return res.status(400).send('Numero de questões deve ser entre 1 e 20');
  }

  if(quizIndex < 0){
    return res.status(400).send('Quiz index deve ser preenchido e ser maior ou igual a 0');    
  }

  if(!examTitle){
    return res.status(400).send('Titulo do exame deve ser preenchido');
  }
  const collection = req.app.locals.database.collection('exams');
  const exame = await collection.findOne({ 'title': examTitle });

  if (exame) {
    if (quizIndex >= 0 && quizIndex < exame.quizzes.length) {
      const quiz = exame.quizzes[quizIndex]; 
      const file = req.files.file;
      const content = file.data.toString('utf-8');
      const chunks = splitContent(content);
      logger.info(`chunks size: ${chunks.length}, numQuestions: ${numQuestions}, quizIndex: ${quizIndex}`);
      //Process each chunk with OpenAI API (example)
      const results = await Promise.all(chunks.map(async (chunk) => {
        const prompt = `Gere 20 perguntas e retorne apenas o JSON
      com o seguinte modelo:
      [{"question":"Questão 1","options":[{"text":"Alternativa 1","correct":true},{"text":"Alternativa 2","correct":false},{"text":"Alternativa 3","correct":false},{"text":"Alternativa 4","correct":false}]}]
    
      Conteúdo:
      ${chunk}
      `;
        const response = await openai.chat.completions.create({
          messages: [{ role: 'system', content: prompt }],
          model: 'gpt-4o',
          max_completion_tokens: TOKEN_LIMIT,
        });    
        const jsonResponse = response.choices[0].message.content.replace(/```json|```/g, '').trim();
        return jsonResponse;
      }));
      const quizQuestions = results.join(',');
      quiz.questions = quiz.questions.concat(JSON.parse(`[${quizQuestions}]`));
      await collection.updateOne(
        { 'title': examTitle, 'quizzes.index': quizIndex },
        { $set: { 'quizzes.$.questions': quiz.questions } }
      );
      res.send('Questões inseridas com sucesso');    
    } else {
      res.status(404).send('Quiz não encontrado');
    }
  }
  else{
    res.status(404).send('Exame não encontrado');
  }

  
};

module.exports = {
  processUpload,
};