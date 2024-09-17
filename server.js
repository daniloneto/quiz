require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const { connectToDatabase } = require('./config/database');
const { redisClient } = require('./config/redis');
const routes = require('./routes');

const app = express();
const port = process.env.PORT;

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('trust proxy', 1);

app.use('/api', routes);

connectToDatabase()
  .then((database) => {
    app.locals.database = database;
    app.listen(port, () => {
      console.log(`Servidor rodando em http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Erro ao iniciar o servidor:', error);
  });

redisClient.connect().then(() => {
  console.log('Conectado ao Redis.');
});
