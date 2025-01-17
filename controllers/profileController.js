const { ObjectId } = require('mongodb');
const logger = require('../config/logger');

async function getProfile (req, res) {
  try {      
    const { id } = req.params;

    const profile = await req.app.locals.database.collection('profile').findOne(
      { _id: new ObjectId(id) },
      { projection: { _id: 1, nome: 1, email: 1, pontos: 1, nivel: 1, data_criacao: 1 } }
    );
  
    if (!profile) {
      return res.status(404).json({ message: 'Perfil não encontrado' });
    }
  
    res.status(200).json(profile);
  } catch (error) {      
    logger.error(`Erro ao buscar o perfil: ${error.message}`, { error });
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}

// Função para buscar os níveis do banco de dados
async function buscarNiveis (database) {
  return await database.collection('levels').find().sort({ pontos: 1 }).toArray();
}
  
// Função para calcular o nível baseado nos pontos e níveis do banco de dados
function calcularNivel (pontos, niveis) {

  // Compara os pontos do jogador com os limites de cada nível
  for (let i = 0; i < niveis.length; i++) {
    if (pontos >= niveis[i].pontos && pontos <= niveis[i].limiteSuperior) {
      return niveis[i].nivel;
    }
  }
  return 1; // Caso os pontos não se encaixem em nenhum nível
}

// Função para atualizar pontos e nível do usuário
async function atualizarPontos (req, res) {
  const { userId, pontos } = req.body;
  
  try {
    const database = req.app.locals.database;
  
    // Buscar o perfil do usuário
    const userProfile = await database.collection('profile').findOne({ _id: new ObjectId(userId) });
    if (!userProfile) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
  
    // Buscar os níveis do banco de dados
    const niveis = await buscarNiveis(database);
  
    // Somar os pontos novos aos pontos existentes
    const pontosTotais = userProfile.pontos + pontos;
    const nivel = calcularNivel(pontosTotais, niveis);
  
    // Atualizar pontos e nível no banco de dados
    await database.collection('profile').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { pontos: pontosTotais, nivel: nivel } }
    );
  
    res.status(200).send({ success: true, nivel: nivel });
  } catch (error) {
    logger.error(`Erro ao atualizar os pontos: ${error.message}`, { error });
    res.status(500).send({ success: false, message: error.message });
  }
}
async function getLevels (req,res){
  try {
    const database = req.app.locals.database;    
    const niveis = await buscarNiveis(database);
    res.status(200).json(niveis);
  } catch (error){
    logger.error(`Erro ao buscar os níveis: ${error.message}`, { error });
    res.status(500).send({message: 'Erro interno do servidor'});
  }        
}

module.exports = {  
  getProfile,
  atualizarPontos,
  getLevels
};
  