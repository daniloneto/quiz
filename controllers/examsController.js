const { ObjectId } = require('mongodb');

async function getQuizByIndex(req, res) {
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
}
async function updateQuestion(req, res) {
    try {
        const { examId, quizIndex, questionIndex, optionIndex, newValue } = req.body;
        const collection = req.app.locals.database.collection('exams');

        const exame = await collection.findOne({ "_id": new ObjectId(examId) });

        if (exame) {
            const quiz = exame.quizzes.filter((q, index) => index === quizIndex)[0];        
            if (quizIndex !== -1 && questionIndex >= 0 && questionIndex < quiz.questions.length) {
                const question = quiz.questions[questionIndex];
                question.options[optionIndex].text = newValue;

                await collection.updateOne(
                    { "_id": new ObjectId(examId), [`quizzes.title`]: quiz.title },
                    { $set: { [`quizzes.${quizIndex}.questions.${questionIndex}`]: question } }
                );
                res.status(200).send('Pergunta atualizada com sucesso');
            } else {
                res.status(404).send('Quiz ou pergunta não encontrada');
            }
        } else {
            res.status(404).send('Exame não encontrado');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao atualizar a pergunta');
    }
}
async function addQuestion(req, res) {
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
}

async function createExam(req, res) {
    try {
        const exam = req.body;
        const collection = req.app.locals.database.collection('exams');
        await collection.insertOne(exam);
        res.status(201).send('Prova cadastrada com sucesso');
    } catch (error) {
        console.error('Erro ao cadastrar a prova:', error);
        res.status(500).send('Erro ao cadastrar a prova');
    }
}

async function getAllExams(req, res) {
    try {
        const collection = req.app.locals.database.collection('exams');
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const exams = await collection.find({})
            .skip(skip)
            .limit(limit)
            .toArray();
        
        const total = await collection.countDocuments();
        res.status(200).json({ exams, total, page, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao obter as provas');
    }
}


async function deleteExam(req, res) {
    try {
        if(req.params.id){
            const examId = req.params.id;
            const collection = req.app.locals.database.collection('exams');
            const result = await collection.deleteOne({ _id: new ObjectId(examId) });

            if (result.deletedCount > 0) {
                res.status(200).send('Prova excluída com sucesso');
            } else {
                res.status(404).send('Prova não encontrada');
            }
        }
        else{
            res.status(404).send('Prova não encontrada');
        }
    } catch (error) {
        console.error('Erro ao excluir a prova:', error);
        res.status(500).send('Erro ao excluir a prova');
    }
}

module.exports = {
    getQuizByIndex,
    addQuestion,
    updateQuestion,
    createExam,
    getAllExams,
    deleteExam,
};
