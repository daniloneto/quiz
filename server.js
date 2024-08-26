const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

app.use(cors());
app.use(bodyParser.json());

let database;

app.use(express.static(path.join(__dirname, 'public')));

async function connectToDatabase() {
    try {
        await client.connect();
        database = client.db('quizDB');
        console.log('Conectado ao MongoDB');
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB', error);
    }
}
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.get('/backup', async (req, res) => {
    try {
        const collection = database.collection('exams');
        const exams = await collection.find({}).toArray();

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(__dirname, `backup-${timestamp}.json`);
        
        fs.writeFileSync(backupPath, JSON.stringify(exams, null, 2), 'utf-8');

        res.json(exams);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao obter os quizzes');
    }
});

app.get('/exam/:title/quiz/:index', async (req, res) => {
    try {
        const quizIndex = parseInt(req.params.index, 10);
        const examTitle = req.params.title;
        const collection = database.collection('exams');
        const exame = await collection.findOne({ "title": examTitle });           
        if(exame){
                if (quizIndex >= 0 && quizIndex < exame.quizzes.length) {
                    res.json(exame.quizzes[quizIndex]);
                } else {
                    res.status(404).send('Quiz não encontrado');
                }            
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao obter o quiz');
    }
});

app.post('/add-question', async (req, res) => {
    try {        
        const { exam, quiz, newQuizTitle, question, optionA, optionB, optionC, optionD, correctOption } = req.body;
        const collection = database.collection('exams');

        const exame = await collection.findOne({ "title": exam });        
        if (exame) {
            const quizIndex = exame.quizzes.findIndex(q => q.title === quiz);
            console.log(quizIndex);
            const newQuestion = {
                question,
                options: [
                    { text: optionA, correct: correctOption === 'A' },
                    { text: optionB, correct: correctOption === 'B' },
                    { text: optionC, correct: correctOption === 'C' },
                    { text: optionD, correct: correctOption === 'D' }
                ]
            };
            if (quizIndex !== -1) {                
                await collection.updateOne(
                    { "title": exam, [`quizzes.${quizIndex}.title`]: quiz },
                    { $push: { [`quizzes.${quizIndex}.questions`]: newQuestion } }
                );
                res.status(200).send('Pergunta adicionada com sucesso');
            } else {
                // Quiz não existe, criar novo quiz com a pergunta
                await collection.updateOne(
                    { "title": exam },
                    { $push: { quizzes: { title: quiz, questions: [newQuestion] } } }
                );
            }
            res.status(200).send('Pergunta adicionada com sucesso');
        } else {
            res.status(404).send('Exame não encontrado');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao adicionar a pergunta');
    }
});
app.post('/add-quiz', async (req, res) => {
    try {
        const { examTitle, quiz } = req.body;
        const collection = database.collection('exams');

        const exam = await collection.findOne({ "title": examTitle });
        if (exam) {
            await collection.updateOne(
                { "title": examTitle },
                { $push: { quizzes: quiz } }
            );
            res.status(200).send('Quiz cadastrado com sucesso');
        } else {
            res.status(404).send('Exame não encontrado');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao cadastrar o quiz');
    }
});

app.post('/exams', async (req, res) => {
    try {
        const exam = req.body;
        const collection = database.collection('exams');
        await collection.insertOne(exam);
        res.status(201).send('Prova cadastrada com sucesso');
    } catch (error) {
        console.error('Erro ao cadastrar a prova:', error);
        res.status(500).send('Erro ao cadastrar a prova');
    }
});

app.get('/exams', async (req, res) => {
    try {
        const collection = database.collection('exams');
        const exams = await collection.find({}).toArray();
        res.json(exams);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao obter as provas');
    }
});

app.post('/exams/:id/quizzes', async (req, res) => {
    try {
        const examId = req.params.id;
        const { quizIndex } = req.body;
        const examsCollection = database.collection('exams');
        const quizzesCollection = database.collection('quizzes');
        
        // Obter todos os quizzes
        const quizzes = await quizzesCollection.find({}).toArray();
        
        // Verificar se o índice do quiz é válido
        if (quizIndex >= 0 && quizIndex < quizzes[0].quizzes.length) {
            const quiz = quizzes[0].quizzes[quizIndex];
            
            // Adicionar o quiz à prova
            const result = await examsCollection.updateOne(
                { _id: new ObjectId(examId) },
                { $push: { quizzes: quiz } }
            );
            
            if (result.modifiedCount > 0) {
                res.status(200).send('Quiz associado com sucesso');
            } else {
                res.status(404).send('Prova não encontrada');
            }
        } else {
            res.status(400).send('Índice do quiz inválido');
        }
    } catch (error) {
        console.error('Erro ao associar o quiz:', error);
        res.status(500).send('Erro ao associar o quiz');
    }
});

app.delete('/exams/:id', async (req, res) => {
    try {
        const examId = req.params.id;
        const collection = database.collection('exams');
        const result = await collection.deleteOne({ _id: new ObjectId(examId) });

        if (result.deletedCount > 0) {
            res.status(200).send('Prova excluída com sucesso');
        } else {
            res.status(404).send('Prova não encontrada');
        }
    } catch (error) {
        console.error('Erro ao excluir a prova:', error);
        res.status(500).send('Erro ao excluir a prova');
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    connectToDatabase();
});
