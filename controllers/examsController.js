const { ObjectId } = require('mongodb');
const logger = require('../config/logger');

async function getQuizByIndex (req, res) {
  try {
    const quizIndex = parseInt(req.params.index, 10);
    const examTitle = req.params.title;
    const collection = req.app.locals.database.collection('exams');
    const exame = await collection.findOne({ 'title': examTitle });

    if (exame) {
      if (quizIndex >= 0 && quizIndex < exame.quizzes.length) {
        res.status(200).json(exame.quizzes[quizIndex]);
      } else {
        res.status(404).send('Quiz não encontrado');
      }
    }
  } catch (error) {
    logger.error('Erro ao obter o quiz:', error);
    res.status(500).send('Erro ao obter o quiz');
  }
}

async function createExam (req, res) {
  try {
    const exam = req.body;
    const collection = req.app.locals.database.collection('exams');
    await collection.insertOne(exam);
    res.status(201).send('Prova cadastrada com sucesso');
  } catch (error) {    
    logger.error('Erro ao cadastrar a prova:', error);
    res.status(500).send('Erro ao cadastrar a prova');
  }
}

async function getAllExams (req, res) {
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
    logger.error('Erro ao obter as provas:', error);
    res.status(500).send('Erro ao obter as provas');
  }
}


async function deleteExam (req, res) {
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
    logger.error('Erro ao excluir a prova:', error);
    res.status(500).send('Erro ao excluir a prova');
  }
}

module.exports = {
  getQuizByIndex,    
  createExam,
  getAllExams,
  deleteExam,
};
