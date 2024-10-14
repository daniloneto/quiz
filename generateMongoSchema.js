const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const path = require('path');

async function generateSchemas () {
  const client = new MongoClient('mongodb');

  try {
    await client.connect();
    const db = client.db('dbName');
    const collections = await db.listCollections().toArray(); // Lista todas as coleções do banco

    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;

      // Ignorar a coleção "log"
      if (collectionName === 'log') {
        continue;
      }

      const sampleDoc = await db.collection(collectionName).findOne(); // Buscar o primeiro documento da coleção

      if (!sampleDoc) {
        console.log(`A coleção '${collectionName}' está vazia ou nenhum documento foi encontrado.`);
        continue; // Passa para a próxima coleção se estiver vazia
      }

      // Função para analisar profundamente o documento e gerar o schema
      function analyzeDocument (doc) {
        const schema = {};

        Object.keys(doc).forEach(key => {
          const value = doc[key];
          const valueType = typeof value;

          // Ignorar análise do campo _id
          if (key === '_id') {
            schema[key] = { type: valueType }; // Adiciona o campo _id como simples
            return;
          }

          if (value instanceof Date) {
            schema[key] = { type: 'date' }; // Trata como Date
            return;
          }

          if (valueType === 'object' && value !== null) {
            if (Array.isArray(value)) {
              // Se o valor for um array, analisar o conteúdo do array
              schema[key] = {
                type: 'array',
                items: value.length > 0 ? analyzeDocument(value[0]) : 'empty'
              };
            } else {
              // Se for um objeto, analisar recursivamente
              schema[key] = {
                type: 'object',
                properties: analyzeDocument(value)
              };
            }
          } else {
            // Caso seja um valor primitivo (string, number, boolean, etc.)
            schema[key] = { type: valueType };
          }
        });

        return schema;
      }

      const schema = analyzeDocument(sampleDoc);

      // Gerar o código do schema Mongoose
      const mongooseSchema = generateMongooseSchema(collectionName, schema);
      
      // Salvar o schema no diretório models
      const filePath = path.join(__dirname, 'models', `${capitalizeFirstLetter(collectionName)}.js`);

      // Salvar o schema em um arquivo
      fs.writeFileSync(filePath, mongooseSchema);
      console.log(`Schema Mongoose gerado e salvo em: ${filePath}`);
    }

  } catch (err) {
    console.error('Erro ao gerar os schemas:', err);
  } finally {
    await client.close();
  }
}

function generateMongooseSchema (collectionName, schema) {
  let mongooseSchemaString = 'const mongoose = require(\'mongoose\');\n\n';
  mongooseSchemaString += `const ${capitalizeFirstLetter(collectionName)}Schema = new mongoose.Schema({\n`;
  
  Object.keys(schema).forEach(key => {
    const field = schema[key];
    
    if (key === '_id') {      
      return;
    }
      
    if (field.type === 'array') {
      mongooseSchemaString += `  ${key}: [{ type: ${mapTypeToMongoose(field.items)} }],\n`;
    } else if (field.type === 'object') {
      mongooseSchemaString += `  ${key}: ${capitalizeFirstLetter(key)}Schema,\n`; // Chama o schema aninhado
    } 
    else if (field.type === 'date') {
      mongooseSchemaString += `  ${key}: { type: Date },\n`; // Define como Date diretamente
    }
    else {
      mongooseSchemaString += `  ${key}: { type: ${mapTypeToMongoose(field)} },\n`;
    }
  });
  
  mongooseSchemaString += '});\n\n';
  mongooseSchemaString += `module.exports = mongoose.model('${capitalizeFirstLetter(collectionName)}', ${capitalizeFirstLetter(collectionName)}Schema);\n`;
  
  return mongooseSchemaString;
}

// Mapeamento dos tipos JavaScript para Mongoose
function mapTypeToMongoose (field) {
  if (field.type === 'string') return 'String';
  if (field.type === 'number') return 'Number';
  if (field.type === 'boolean') return 'Boolean';
  if (field.type === 'object') return 'Object';
  if (field.type === 'date') return 'Date';
  // Você pode adicionar mais tipos se necessário
  return 'Mixed'; // Para tipos desconhecidos
}

// Função auxiliar para capitalizar a primeira letra
function capitalizeFirstLetter (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

generateSchemas().catch(console.error);
