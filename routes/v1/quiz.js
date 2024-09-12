const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const authenticateToken = require('../../middleware');


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
router.post('/save-quiz-result', authenticateToken, async (req, res) => {
    try {
        const { userId, examId, quizIndex, correctAnswers, totalQuestions } = req.body;
    
        if (!userId || !examId || quizIndex === undefined || correctAnswers === undefined || !totalQuestions) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }
    
        const filter = {
            userId: new ObjectId(userId),
            examId: new ObjectId(examId),
            quizIndex
        };
    
        const update = {
            $push: {
                answers: {
                    correctAnswers,
                    totalQuestions,
                    date: new Date()
                }
            }
        };
    
        const options = { upsert: true };
    
        const result = await req.app.locals.database.collection('quizResults').updateOne(filter, update, options);
    
        if (result.upsertedCount > 0) {
            res.status(201).json({ message: 'Resultado do quiz salvo com sucesso.', resultId: result.upsertedId._id });
        } else {
            res.status(200).json({ message: 'Resultado do quiz atualizado com sucesso.' });
        }
    } catch (error) {
        console.error('Erro ao salvar resultado do quiz:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});


module.exports = router;