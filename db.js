const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function connectToDatabase() {
    try {
        await client.connect();
        const database = client.db('quizDB');
        console.log('Conectado ao MongoDB');
        return database;
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB', error);
        throw error;
    }
}

module.exports = { connectToDatabase, client };