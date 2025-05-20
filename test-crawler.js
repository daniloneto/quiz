// Script para testar o endpoint de crawler
// Salve como test-crawler.js e rode com: node test-crawler.js

const fetch = require('node-fetch'); // Versão 2.x é compatível com require
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Tentar carregar o arquivo .env.test primeiro
const defaultEnvPath = path.join(__dirname, '.env');

// Carregar o arquivo de configuração apropriado
if (fs.existsSync(defaultEnvPath)) {
  console.log('📄 Usando arquivo .env.test para configurações');
  dotenv.config({ path: defaultEnvPath });
} else {
  console.log('📄 Usando arquivo .env padrão para configurações');
  dotenv.config();
}

// Forçar bypass do rate limiter para testes
process.env.BYPASS_RATELIMIT = 'true';

// Pegar variáveis de ambiente ou parâmetros da linha de comando
let API_KEY = process.env.API_KEY;
let TEST_TOKEN = process.env.TEST_TOKEN || "test-token-for-development"; // Token simulado para desenvolvimento

// Verificar argumentos da linha de comando
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--api-key' && i + 1 < args.length) {
    API_KEY = args[i + 1];
    i++; // pular o próximo argumento
  } else if (args[i] === '--token' && i + 1 < args.length) {
    TEST_TOKEN = args[i + 1];
    i++; // pular o próximo argumento
  }
}

async function checkConfiguration() {
  console.log('Verificando configurações...');
  
  // Verificar se temos as credenciais necessárias
  if (!API_KEY) {
    console.error('❌ API_KEY não encontrada!');
    console.log('⚠️ Configure API_KEY no arquivo .env.test ou use --api-key SUA_API_KEY');
    process.exit(1);
  }

  if (!TEST_TOKEN) {
    console.warn('⚠️ TEST_TOKEN não encontrado, usando token simulado para desenvolvimento');
  }
  
  console.log('✅ Configurações encontradas. Usando API Key:', API_KEY.substring(0, 3) + '***');
  
  try {
    // Verificar se o servidor está rodando
    console.log('📡 Verificando se o servidor está rodando...');
    const pingResponse = await fetch('http://localhost:3000/api', {
      method: 'GET',
    }).catch(error => {
      throw new Error('Servidor não parece estar rodando');
    });
    
    console.log('✅ Servidor está rodando!');
  } catch (error) {
    console.warn('⚠️ Aviso:', error.message);
    console.log('  Certifique-se de que o servidor Next.js está rodando com:');
    console.log('  > npm run dev');
    // Continuamos mesmo assim, em caso de endpoint não existir
  }
}

async function createExamIfNeeded() {
  // Primeiro tenta criar um exame para teste
  console.log('Criando exame de teste (se não existir)...');
  try {
    const examResponse = await fetch('http://localhost:3000/api/v1/exams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify({
        title: "GitHub Foundations",
        description: "Simulado para GitHub Foundations",
        subject: "Tecnologia"
      })
    });
    
    if (examResponse.status === 201) {
      console.log('✅ Exame criado com sucesso!');
    } else if (examResponse.status === 400) {
      console.log('ℹ️ O exame provavelmente já existe, continuando...');
    } else {
      console.warn('⚠️ Status inesperado ao criar exame:', examResponse.status);
      const text = await examResponse.text();
      console.log('Resposta:', text);
    }
  } catch (error) {
    console.error('❌ Erro ao criar exame:', error.message);
    console.log('Certifique-se de que o servidor está rodando em http://localhost:3000');
  }
}

async function testCrawler() {
  // Tenta criar o exame primeiro
  await createExamIfNeeded();
  
  const body = {
    numQuestions: 10, 
    quizTitle: "GitHub Foundations Parte 2",
    examTitle: "GitHub Foundations", 
    lingua: "pt",
    urls: [
     "https://learn.microsoft.com/pt-br/training/modules/contribute-open-source/1-introduction/?ns-enrollment-type=learningpath&ns-enrollment-id=learn.github-foundations-2",
     "https://learn.microsoft.com/pt-br/training/modules/contribute-open-source/2-identify/?ns-enrollment-type=learningpath&ns-enrollment-id=learn.github-foundations-2",
    ]
  };
  try {
    console.log('Enviando requisição para o endpoint crawler...');
    console.log('Body:', JSON.stringify(body, null, 2));
    
    const response = await fetch('http://localhost:3000/api/v1/crawler', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify(body)
    });

    console.log('Status HTTP:', response.status);
    console.log('Headers:', JSON.stringify(Object.fromEntries([...response.headers]), null, 2));
    
    const text = await response.text();
    let data;
    
    try {
      data = JSON.parse(text);
      console.log('Resposta (JSON):', data);
    } catch (e) {
      console.log('Resposta (texto):', text);
    }
  } catch (error) {
    console.error('Erro ao testar crawler:', error);
    console.error('Detalhes do erro:', error.stack);
  }
}

async function main() {
  await checkConfiguration();
  await testCrawler();
}

main().catch(error => {
  console.error('Erro fatal no script de teste:', error);
  process.exit(1);
});
