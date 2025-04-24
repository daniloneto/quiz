import openai from '../config/openaiConfig';
import logger from '../config/logger';

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

const uploadController = {
  processUpload: async (req, res) => {
    try {
      const numQuestions = req.body.numQuestions;
      const quizTitle = req.body.quizTitle; 
      const examTitle = req.body.examTitle; 
      const lingua = req.body.lingua;
      
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
      }

      if(numQuestions < 1 || numQuestions > 20){
        return res.status(400).send('Numero de questões deve ser entre 1 e 20');
      }

      if(quizTitle === undefined || quizTitle === null){
        return res.status(400).send('Quizdeve ser preenchido');    
      }

      if(!examTitle){
        return res.status(400).send('Titulo do exame deve ser preenchido');
      }
      const collection = req.app.locals.database.collection('exams');
      const exame = await collection.findOne({ 'title': examTitle });

      if (exame) {       
        const file = req.files.file;
        const content = file.data.toString('utf-8');
        const chunks = splitContent(content);
        logger.info(`chunks size: ${chunks.length}, numQuestions: ${numQuestions}`);    
        const results = await Promise.all(chunks.map(async (chunk) => {
          const prompt = `Você deve gerar exatamente ${numQuestions} perguntas e, para cada uma delas, 4 opções de resposta. 
A resposta deve estar no seguinte formato JSON:
{
  "questions": [
    {
      "question": "Texto da pergunta",
      "options": [
        {"text": "Opção 1", "correct": true/false},
        {"text": "Opção 2", "correct": true/false},
        {"text": "Opção 3", "correct": true/false},
        {"text": "Opção 4", "correct": true/false}
      ]
    }
  ]
}
- Apenas uma das opções por pergunta deve ser marcada como "correct": true.
- Todos os textos devem ser escapados corretamente para evitar problemas de caracteres.
- Use o seguinte conteúdo para gerar as perguntas em ${lingua}: ${chunk}
          `;
          const response = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-4o',
            max_completion_tokens: TOKEN_LIMIT,
          });    
          const jsonResponse = response.choices[0].message.content.replace(/```json|```/g, '').trim();      
          return jsonResponse;
        })); 

        const perguntasCombinadas = {
          questions: results.reduce((acc, jsonString) => {
            const conjunto = JSON.parse(jsonString);
            return acc.concat(conjunto.questions);
          }, [])
        };

        logger.info(`perguntasCombinadas: ${JSON.stringify(perguntasCombinadas)}`);

        await collection.updateOne(
          { 'title': examTitle },
          { $push: { quizzes: { title: quizTitle, questions: perguntasCombinadas.questions } } },      
        );
        res.send('Questões inseridas com sucesso');    
      } else {
        res.status(404).send('Exame não encontrado');
      }
    } catch(err) {
      logger.error('Error processing upload:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error processing upload'
      });
    }
  }
};

export default uploadController;
