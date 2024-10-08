const { ObjectId } = require('mongodb');
const logger = require('../config/logger');

async function updateQuestion (req, res) {
  try {
    const { examId, quizIndex, questionIndex, optionIndex, newValue } = req.body;
    const collection = req.app.locals.database.collection('exams');

    const exame = await collection.findOne({ '_id': new ObjectId(examId) });

    if (exame) {
      const quiz = exame.quizzes.filter((q, index) => index === quizIndex)[0];        
      if (quizIndex !== -1 && questionIndex >= 0 && questionIndex < quiz.questions.length) {
        const question = quiz.questions[questionIndex];
        question.options[optionIndex].text = newValue;

        await collection.updateOne(
          { '_id': new ObjectId(examId), ['quizzes.title']: quiz.title },
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
async function addQuestion (req, res) {
  try {
    const { exam, quiz, question, optionA, optionB, optionC, optionD, correctOption } = req.body;
    const collection = req.app.locals.database.collection('exams');

    const exame = await collection.findOne({ 'title': exam });
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
          { 'title': exam, [`quizzes.${quizIndex}.title`]: quiz },
          { $push: { [`quizzes.${quizIndex}.questions`]: newQuestion } }
        );
        res.status(200).send('Pergunta adicionada com sucesso');
      } else {
        await collection.updateOne(
          { 'title': exam },
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
async function deleteQuestion (req, res) {
  try {
    const { examId, quizIndex, questionIndex } = req.body;
    const collection = req.app.locals.database.collection('exams');

    const exame = await collection.findOne({ '_id': new ObjectId(examId) });

    if (exame) {
      const quiz = exame.quizzes[quizIndex];
      if (quiz && questionIndex >= 0 && questionIndex < quiz.questions.length) {
        // Remover a questão do quiz
        quiz.questions.splice(questionIndex, 1);

        // Atualizar o exame no banco de dados
        await collection.updateOne(
          { '_id': new ObjectId(examId), ['quizzes.title']: quiz.title },
          { $set: { [`quizzes.${quizIndex}.questions`]: quiz.questions } }
        );

        res.status(200).send('Pergunta deletada com sucesso');
      } else {
        res.status(404).send('Quiz ou pergunta não encontrada');
      }
    } else {
      res.status(404).send('Exame não encontrado');
    }
  } catch (error) {  
    logger.error(`Erro ao deletar a pergunta: ${error.message}`, { error });       
    res.status(500).send('Erro ao deletar a pergunta');
  }
}

module.exports = {
  addQuestion,
  updateQuestion,
  deleteQuestion
};