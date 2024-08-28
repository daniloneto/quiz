const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const authenticateToken = require('../../middleware');
/**
 * @swagger
 * tags:
 *   name: Exams
 *   description: API para gerenciamento de provas (v1)
 */

/**
 * @swagger
 * /api/v1/exam/:title/quiz/:index:
 *   get:
 *     summary: Obter um quiz de um exame
 *     tags:
 *       - Exams
 *     parameters:
 *       - in: path
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *         description: sigla do Exame
 *       - in: path 
 *         name: index
 *         required: true
 *         schema:
 *           type: number
 *         description: numero do Quiz
 *     responses:
 *       200:
 *         description: Quizzes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object 
 *       500:
 *         description: Erro ao obter o quiz
 *       404:
 *         description: Quiz não encontrado
 */
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
/**
 * @swagger
 * /api/v1/question:
 *   post:
 *     summary: Cria uma nova questão
 *     tags:
 *       - Exams
 *     responses:
 *       201:
 *         description: Pergunta adicionada com sucesso
 *       404:
 *         description: Exame não encontrado
 *       500:
 *         description: Erro ao adicionar a pergunta
 */ 
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
/**
 * @swagger
 * /api/v1/quiz:
 *   post:
 *     summary: Cria um novo quiz
 *     tags:
 *       - Exams
 *     responses:
 *       201:
 *         description: Quiz adicionada com sucesso
 *       404:
 *         description: Exame não encontrado
 *       500:
 *         description: Erro ao cadastrar o quiz
 */ 
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
/**
 * @swagger
 * /api/v1/exams:
 *   post:
 *     summary: Cria uma nova prova
 *     tags:
 *       - Exams
 *     responses:
 *       201:
 *         description: Prova cadastrada com sucesso
 *       500:
 *         description: Erro ao cadastrar a prova
 *   get:
 *     summary: Obter lista de provas
 *     tags:
 *       - Exams
 *     responses:
 *       200:
 *         description: Exams
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Erro ao obter o quiz
 *       404:
 *         description: Quiz não encontrado
 */ 
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

router.post('/exams/:id/quizzes',authenticateToken, async (req, res) => {
    try {
        const examId = req.params.id;
        const { quizIndex } = req.body;
        const examsCollection = req.app.locals.database.collection('exams');
        const quizzesCollection = req.app.locals.database.collection('quizzes');

        const quizzes = await quizzesCollection.find({}).toArray();

        if (quizIndex >= 0 && quizIndex < quizzes[0].quizzes.length) {
            const quiz = quizzes[0].quizzes[quizIndex];

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
/**
 * @swagger
 * /api/v1/exams/:id:
 *   delete:
 *     summary: Deleta um exame pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do recurso a ser deletado
 *     responses:
 *       200:
 *         description: Prova excluída com sucesso
 *       404:
 *         description: Prova não encontrada
 *       500:
 *         description: Erro ao excluir a prova
 */
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
