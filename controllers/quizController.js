const { ObjectId } = require('mongodb');

async function createQuiz(req, res) {
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
}

async function saveQuizResult(req, res) {
    try {
        const { userId, examId, quizIndex, correctAnswers, totalQuestions } = req.body;

        if (!userId || !examId || quizIndex === undefined || correctAnswers === undefined || !totalQuestions) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }

        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'ID de usuário inválido.' });
        }
        
        if (!ObjectId.isValid(examId)) {
            return res.status(400).json({ message: 'ID de exame inválido.' });
        }
        
        const filter = {
            userId: new ObjectId(userId),
            examId: new ObjectId(examId)
        };

        const update = {
            $set: {
                [`quizzes.${quizIndex}.quizIndex`]: quizIndex
            },
            $push: {
                [`quizzes.${quizIndex}.answers`]: {
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
}

async function getQuizResults(req, res) {
    try {
        const { userId } = req.params;

        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'ID de usuário inválido.' });
        }

        const results = await req.app.locals.database.collection('quizResults').find({ userId: new ObjectId(userId) }).toArray();

        if (results.length === 0) {
            return res.status(404).json({ message: 'Nenhum resultado encontrado para este usuário.' });
        }

        const collection = req.app.locals.database.collection('exams');
        await Promise.all(results.map(async (result) => {
            const exam = await collection.findOne({ "_id": result.examId });
            result.examTitle = exam.title;
        }));

        res.status(200).json(results);
    } catch (error) {
        console.error('Erro ao obter resultados dos quizzes:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

module.exports = {
    createQuiz,
    saveQuizResult,
    getQuizResults,
};