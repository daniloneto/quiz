const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const authenticateToken = require('../../middleware');

router.get('/exam/:title/quiz/:index',authenticateToken, async (req, res) => {
    try {
        const quizIndex = parseInt(req.params.index, 10);
        const examTitle = req.params.title;
        const collection = req.app.locals.database.collection('exams');
        const exame = await collection.findOne({ "title": examTitle });

        if (exame) {
            if (quizIndex >= 0 && quizIndex < exame.quizzes.length) {
                res.status(200).json(exame.quizzes[quizIndex]);
            } else {
                res.status(404).send('Quiz não encontrado');
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao obter o quiz');
    }
});

router.post('/question', authenticateToken, async (req, res) => {
    try {
        const { exam, quiz, question, optionA, optionB, optionC, optionD, correctOption } = req.body;
        const collection = req.app.locals.database.collection('exams');

        const exame = await collection.findOne({ "title": exam });
        if (exame) {
            const quizIndex = exame.quizzes.findIndex(q => q.title === quiz);
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
                await collection.updateOne(
                    { "title": exam },
                    { $push: { quizzes: { title: quiz, questions: [newQuestion] } } }
                );
                res.status(200).send('Pergunta adicionada com sucesso');
            }
        } else {
            res.status(404).send('Exame não encontrado');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao adicionar a pergunta');
    }
});

router.post('/quiz',authenticateToken,  async (req, res) => {
    try {
        const { examTitle, quiz } = req.body;
        const collection = req.app.locals.database.collection('exams');

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

router.post('/exams',authenticateToken, async (req, res) => {
    try {
        const exam = req.body;
        const collection = req.app.locals.database.collection('exams');
        await collection.insertOne(exam);
        res.status(201).send('Prova cadastrada com sucesso');
    } catch (error) {
        console.error('Erro ao cadastrar a prova:', error);
        res.status(500).send('Erro ao cadastrar a prova');
    }
});

router.get('/exams',authenticateToken, async (req, res) => {
    try {
        const collection = req.app.locals.database.collection('exams');
        const exams = await collection.find({}).toArray();
        res.status(200).json(exams);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao obter as provas');
    }
});

router.delete('/exams/:id',authenticateToken, async (req, res) => {
    try {
        const examId = req.params.id;
        const collection = req.app.locals.database.collection('exams');
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

module.exports = router;
