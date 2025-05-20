import axios from 'axios';
import * as cheerio from 'cheerio';
import logger from '../config/logger';
import openai from '../config/openaiConfig';
import { geminiModel } from '../config/geminiConfig';
import 'dotenv/config';

const TOKEN_LIMIT = 3000;  // Aproximadamente 3000 tokens para cada requisição

// Função para dividir o conteúdo em blocos menores, respeitando o limite de tokens
const splitContent = (content: string, maxTokens = TOKEN_LIMIT) => {
  const chunks: string[] = [];
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

// Função para extrair texto de uma página web usando cheerio
const extractTextFromUrl = async (url: string): Promise<string> => {
  try {
    // Configurando timeout e limites de tamanho
    const response = await axios.get(url, {
      timeout: 10000, // 10 segundos de timeout
      maxContentLength: 2 * 1024 * 1024, // Limite de 2MB
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const contentType = response.headers['content-type'] || '';
    if (!contentType.includes('text/html')) {
      logger.warn(`URL ${url} retornou tipo de conteúdo não HTML: ${contentType}`);
      return '';
    }
    
    const $ = cheerio.load(response.data);
    
    // Remover tags não úteis
    $('script, style, nav, footer, header, iframe, noscript, aside, form, meta').remove();
    
    // Tentar selecionar conteúdo relevante
    let mainContent;
    const contentSelectors = ['main', 'article', '#content', '.content', '.main', '.article', '.post'];
    
    // Tentar cada seletor até encontrar um com conteúdo
    for (const selector of contentSelectors) {
      if ($(selector).length > 0) {
        mainContent = $(selector);
        break;
      }
    }
    
    // Se nenhum seletor específico funcionar, usar o corpo inteiro
    if (!mainContent || mainContent.length === 0) {
      mainContent = $('body');
    }
    
    // Extrair o texto do conteúdo selecionado
    const bodyText = mainContent.text();
    
    // Limpar o texto (remover excesso de espaços em branco)
    const cleanedText = bodyText.replace(/\s+/g, ' ').trim();
    
    logger.info(`Extracted ${cleanedText.length} characters from ${url}`);
    
    // Limitar tamanho máximo para evitar tokens excessivos
    const MAX_CHARS = 50000;
    return cleanedText.length > MAX_CHARS ? cleanedText.substring(0, MAX_CHARS) : cleanedText;
  } catch (error) {
    logger.error(`Error extracting text from URL ${url}:`, error);
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      throw new Error(`Timeout when connecting to URL: ${url}`);
    }
    throw new Error(`Failed to extract text from URL: ${url}`);
  }
};

// Função para gerar perguntas a partir de um texto usando o LLM configurado
const generateQuestionsFromText = async (
  chunk: string, 
  numQuestions: number, 
  lingua: string
): Promise<string> => {
  try {
    // Melhorar o prompt para obter respostas mais consistentes
    const fullPrompt = `Você deve criar ${numQuestions} questões de múltipla escolha em ${lingua} com base no seguinte texto.

Regras:
1. Cada pergunta deve ter exatamente 4 opções
2. Apenas UMA opção deve ser correta
3. Forneça perguntas variadas, abordando diferentes partes do texto
4. Forneça sua resposta APENAS como um objeto JSON válido conforme o formato abaixo

Formato de resposta:
{"questions":[{"question":"Texto da pergunta","options":[{"text":"Opção 1","correct":false},{"text":"Opção 2","correct":true},{"text":"Opção 3","correct":false},{"text":"Opção 4","correct":false}]},...]};

TEXTO PARA PERGUNTAS:
${chunk}`;

    let jsonResponseString = '';
    
    try {
      if (process.env.LLM_PROVIDER === 'gemini') {
        logger.info('Using Gemini LLM');
        const result = await geminiModel.generateContent({
          contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2, // Menos variabilidade para respostas mais previsíveis
          },
        });
        const response = await result.response;
        jsonResponseString = response.text(); // Gemini should now return clean JSON
      } else { // Default to OpenAI
        logger.info('Using OpenAI LLM');
        const openAIResponse = await openai.chat.completions.create({
          messages: [{ role: 'user', content: fullPrompt }],
          model: 'gpt-4o',
          response_format: { type: "json_object" },
          temperature: 0.2, // Menos variabilidade para respostas mais previsíveis
        });
        jsonResponseString = openAIResponse.choices[0].message.content?.replace(/```json|```/g, '').trim() || '{}';
      }
      
      // Verificar se a resposta é um JSON válido
      JSON.parse(jsonResponseString);
      return jsonResponseString;
    } catch (error) {
      logger.error(`Error with LLM response: ${error.message}`);
      
      // Se ocorrer um erro, tentamos mais uma vez com um prompt simplificado
      try {
        logger.info('Retrying with simplified prompt...');
        const simplePrompt = `Crie ${numQuestions} perguntas sobre o texto. Cada uma com 4 opções (apenas 1 correta). Resposta apenas em JSON: {"questions":[{"question":"Pergunta","options":[{"text":"Opção","correct":boolean},...]},...]}`;
        
        if (process.env.LLM_PROVIDER === 'gemini') {
          const result = await geminiModel.generateContent({
            contents: [{ role: 'user', parts: [{ text: simplePrompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          });
          jsonResponseString = result.response.text();
        } else {
          const openAIResponse = await openai.chat.completions.create({
            messages: [{ role: 'user', content: simplePrompt }],
            model: 'gpt-3.5-turbo', // Modelo mais rápido como fallback
            response_format: { type: "json_object" },
          });
          jsonResponseString = openAIResponse.choices[0].message.content?.trim() || '{}';
        }
        
        JSON.parse(jsonResponseString); // Verificar se é JSON válido
        return jsonResponseString;
      } catch (retryError) {
        logger.error(`Retry attempt also failed: ${retryError.message}`);
        // Adicionamos um JSON válido mas vazio como fallback
        return '{"questions":[]}';
      }
    }
  } catch (error) {
    logger.error(`Error generating questions: ${error.message}`);
    return '{"questions":[]}';
  }
};

// Função para processar e validar as questões geradas
const processQuestionsResponses = (jsonResponses: string[]): any[] => {
  const allQuestions: any[] = [];
  
  for (const jsonString of jsonResponses) {
    try {
      // Tentar analisar a string JSON
      const conjunto = JSON.parse(jsonString);
      
      // Verificar se tem a estrutura esperada
      if (conjunto && Array.isArray(conjunto.questions)) {
        // Validar cada pergunta antes de adicionar
        const validQuestions = conjunto.questions.filter(question => {
          // Verificar se a pergunta tem a estrutura básica necessária
          if (!question.question || !Array.isArray(question.options)) {
            return false;
          }
          
          // Verificar se há exatamente 4 opções
          if (question.options.length !== 4) {
            return false;
          }
          
          // Verificar se há exatamente uma opção correta
          const correctOptions = question.options.filter(opt => opt.correct);
          if (correctOptions.length !== 1) {
            return false;
          }
          
          return true;
        });
        
        allQuestions.push(...validQuestions);
      } else {
        logger.warn('Formato JSON inesperado na resposta');
      }
    } catch (error) {
      logger.error('Erro ao analisar JSON da resposta:', error);
    }
  }
  
  return allQuestions;
};

// Controlador principal para processo de crawling
const crawlerController = {
  processCrawl: async (req: any, res: any): Promise<void> => {
    try {
      const numQuestions = req.body.numQuestions;
      const quizTitle = req.body.quizTitle;
      const examTitle = req.body.examTitle;
      const lingua = req.body.lingua;
      const urls = req.body.urls; // Array de URLs para fazer crawling
      
      if (!urls || !Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'URLs must be provided as an array.'
        });
      }

      if (numQuestions < 1 || numQuestions > 20) {
        return res.status(400).json({
          success: false,
          message: 'Number of questions must be between 1 and 20'
        });
      }

      if (quizTitle === undefined || quizTitle === null) {
        return res.status(400).json({
          success: false,
          message: 'Quiz title must be provided'
        });
      }

      if (!examTitle) {
        return res.status(400).json({
          success: false,
          message: 'Exam title must be provided'
        });
      }

      const collection = req.app.locals.database.collection('exams');      
      let exame = await collection.findOne({ 'title': examTitle });

      // Se estamos em ambiente de testes e o exame não existe, vamos criar um
      if (!exame && process.env.BYPASS_RATELIMIT === 'true') {
        logger.info(`Creating test exam "${examTitle}" as it doesn't exist (test mode)`);
        try {
          await collection.insertOne({
            title: examTitle,
            description: 'Exame criado automaticamente para testes',
            subject: 'Testes Automatizados',
            quizzes: []
          });
          exame = await collection.findOne({ 'title': examTitle });
        } catch (error) {
          logger.error('Error creating test exam:', error);
        }
      }

      if (!exame) {
        return res.status(404).json({
          success: false,
          message: 'Exam not found'
        });
      }
      
      // Processar todas as URLs e extrair o conteúdo
      logger.info(`Starting crawling for ${urls.length} URLs`);
      const crawledContents: string[] = [];
      
      // Limitar o número máximo de URLs para evitar abuso
      const MAX_URLS = 50;
      const urlsToProcess = urls.slice(0, MAX_URLS);
      
      if (urlsToProcess.length < urls.length) {
        logger.warn(`Limitando o processamento para ${MAX_URLS} URLs. ${urls.length - MAX_URLS} URLs ignoradas.`);
      }
      
      for (const url of urlsToProcess) {
        try {
          // Validar URL antes de fazer o crawling
          const urlObj = new URL(url); // Isso lançará um erro se a URL for inválida
          
          if (!['http:', 'https:'].includes(urlObj.protocol)) {
            logger.warn(`URL ${url} usa protocolo não suportado. Pulando.`);
            continue;
          }
          
          logger.info(`Crawling URL: ${url}`);
          const content = await extractTextFromUrl(url);
          
          if (content && content.length > 50) { // Garantir que tem conteúdo válido
            crawledContents.push(content);
          } else {
            logger.warn(`Conteúdo insuficiente extraído de ${url}. Pulando.`);
          }
        } catch (error) {
          logger.warn(`Failed to crawl URL ${url}. Skipping.`, error);
          // Continuamos com as outras URLs mesmo se uma falhar
        }
      }
      
      if (crawledContents.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Não foi possível extrair conteúdo válido de nenhuma das URLs fornecidas.'
        });
      }
      
      // Combinar todos os conteúdos e dividir em chunks
      const combinedContent = crawledContents.join(' ');
      const chunks = splitContent(combinedContent);
      
      logger.info(`Total chunks: ${chunks.length}, requested questions: ${numQuestions}`);
      
      // Processar cada chunk e gerar questões
      const chunkResponses: string[] = [];
      for (const chunk of chunks) {
        try {
          const jsonResponse = await generateQuestionsFromText(chunk, numQuestions, lingua);
          chunkResponses.push(jsonResponse);
        } catch (error) {
          logger.error(`Error processing chunk: ${error}`);
        }
      }
      
      // Processar e validar as questões geradas
      const allQuestions = processQuestionsResponses(chunkResponses);
      
      // Limitar ao número máximo de perguntas solicitado (multiplicado pelo número de chunks)
      const maxQuestionsPerChunk = Math.min(numQuestions, 5); // Evitar números muito altos
      const maxTotalQuestions = maxQuestionsPerChunk * chunks.length;
      const finalQuestions = allQuestions.slice(0, maxTotalQuestions);
      
      if (finalQuestions.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Não foi possível gerar perguntas válidas a partir do conteúdo extraído.'
        });
      }
      
      logger.info(`Total combined questions: ${finalQuestions.length}`);
      
      // Adicionar as perguntas ao exame
      await collection.updateOne(
        { 'title': examTitle },
        { $push: { quizzes: { title: quizTitle, questions: finalQuestions } } }
      );
      
      res.json({
        success: true,
        message: 'Questions successfully created from crawled content',
        questionCount: finalQuestions.length
      });
    } catch (err) {
      logger.error('Error processing crawl:', err);
      return res.status(500).json({
        success: false,
        message: 'Error processing crawl request'
      });
    }
  }
};

export default crawlerController;
