const { MongoClient } = require('mongodb');

async function connectToDatabase () {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  return client.db(process.env.DB_NAME);
}
async function initializeDatabase (database) {
  // Índice TTL para expirar documentos após X horas se não estiverem ativados
  await database.collection('profile').createIndex(
    { 'createdAt': 1 },
    { expireAfterSeconds: 3600, partialFilterExpression: { ativado: false } } // 1 hora
  );  
  await database.collection('users').createIndex(
    { 'createdAt': 1 },
    { expireAfterSeconds: 3600, partialFilterExpression: { ativado: false } } // 1 hora
  );

  await database.collection('passwordResetTokens').createIndex(
    { 'createdAt': 1 },
    { expireAfterSeconds: 300 } // 5 minutos
  );

  // Outros índices que você pode precisar
  await database.collection('users').createIndex({ username: 1 }, { unique: true });  
  // Adicione outros índices conforme necessário
}
module.exports = { connectToDatabase,initializeDatabase };
