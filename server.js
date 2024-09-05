const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
const authenticateToken = require('./middleware');

const { connectToDatabase, client } = require('./db');

const app = express();
const port = process.env.PORT;
const secretKey = process.env.JWT_SECRET_KEY;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));


const v1IndexRouter = require('./routes/v1/index');
const v1BackupRouter = require('./routes/v1/backup');
const v1ExamRouter = require('./routes/v1/exam');

app.use('/api/v1', v1IndexRouter);
app.use('/api/v1', v1BackupRouter);
app.use('/api/v1', v1ExamRouter);


app.post('/api/v1/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { username, password: hashedPassword };
    await app.locals.database.collection('users').insertOne(user);
    res.status(201).json({ message: 'Usuário registrado com sucesso' });
});

app.post('/api/v1/login', express.urlencoded({ extended: true }), async (req, res) => {
    console.log('User-Agent:', req.headers['user-agent']);
    const { username, password } = req.body;
    const user = await app.locals.database.collection('users').findOne({ username });
    if (!user) {
        return res.status(401).json({ message: 'Senha incorreta.' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Senha incorreta' });
    }
    const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
    const expirationDate = new Date(Date.now() + 3600000); // 1 hora a partir de agora
    res.status(201).json({ token, expiresAt: expirationDate });
});

// Rota protegida
app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'Esta é uma rota protegida' });
});

connectToDatabase().then(database => {
    app.locals.database = database;
    app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`);
    });
}).catch(error => {
    console.error('Erro ao iniciar o servidor:', error);
});
