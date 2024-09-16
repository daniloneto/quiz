const { MongoClient } = require('mongodb');

async function connectToDatabase() {
  const client = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  return client.db(process.env.DB_NAME);
}

module.exports = { connectToDatabase };
