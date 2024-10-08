const { MongoClient } = require('mongodb');

async function connectToDatabase () {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  return client.db(process.env.DB_NAME);
}

module.exports = { connectToDatabase };
