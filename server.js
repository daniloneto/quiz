const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const { swaggerUi, specsV1 } = require('./swagger');
const { connectToDatabase, client } = require('./db');

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/swagger/v1', swaggerUi.serve, swaggerUi.setup(specsV1));

const v1IndexRouter = require('./routes/v1/index');
const v1BackupRouter = require('./routes/v1/backup');
const v1ExamRouter = require('./routes/v1/exam');

app.use('/api/v1', v1IndexRouter);
app.use('/api/v1', v1BackupRouter);
app.use('/api/v1', v1ExamRouter);

connectToDatabase().then(database => {
    app.locals.database = database;
    app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`);
    });
}).catch(error => {
    console.error('Erro ao iniciar o servidor:', error);
});
