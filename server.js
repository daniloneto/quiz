require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { connectToDatabase,initializeDatabase } = require('./config/database');
//const { redisClient } = require('./config/redis');
const routes = require('./routes');
const logger = require('./config/logger');

const app = express();
const port = process.env.PORT;
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
morgan.format('custom', ':remote-addr :method :url :status :response-time ms - :referrer');

app.use(morgan('custom', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));
app.set('trust proxy', 1);
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    const metadata = {            
      ipAddress: req.ip || 'N/A',
      userAgent: req.headers['user-agent'] || 'N/A',
      endpoint: req.originalUrl || 'N/A'
    };

    logger.info('Requisição recebida:', { metadata });
  }
  next();  
});
app.use('/api', routes);

connectToDatabase()
  .then((database) => {
    app.locals.database = database;    
    return initializeDatabase(database);
  })
  .then(() => {
    app.listen(port, () => {
      logger.info(`Servidor rodando em http://localhost:${port}`);
    });
  })
  .catch((error) => {
    logger.error('Erro ao iniciar o servidor:', error);
  });

// redisClient.connect().then(() => {
//   console.log('Conectado ao Redis.');
// });
