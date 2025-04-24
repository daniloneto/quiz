const { MongoClient } = require('mongodb');

// Adapted for caching MongoDB connection across lambda invocations
const uri = process.env.MONGODB_URI;
const options = {};
let client;
let clientPromise;
if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}
async function connectToDatabase () {
  const client = await clientPromise;
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
