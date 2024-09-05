const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
const authenticateToken = require('./middleware');
const crypto = require('crypto');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const validator = require('validator');

const { connectToDatabase, client } = require('./db');

const app = express();
const port = process.env.PORT;
const secretKey = process.env.JWT_SECRET_KEY;
const hmacKey = process.env.HMAC_SECRET_KEY;
const apiKey = process.env.API_KEY;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const loginLimiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 2 minutos
    max: 10, // Limite de 10 requisições por IP
    message: 'Too many login attempts, please try again later.'
});

const speedLimiter = slowDown({
    windowMs: 2 * 60 * 1000, // 2 minutos
    delayAfter: 3, // Começa a desacelerar após 3 requisições
    delayMs: () => 1000 // Adiciona 500ms de atraso por requisição adicional
});

const v1IndexRouter = require('./routes/v1/index');
const v1BackupRouter = require('./routes/v1/backup');
const v1ExamRouter = require('./routes/v1/exam');

app.use('/api/v1', v1IndexRouter);
app.use('/api/v1', v1BackupRouter);
app.use('/api/v1', v1ExamRouter);

function verifyOrigin(req, res, next) {
    const origin = req.headers.origin || req.headers.referer;
    if (!origin || !origin.startsWith(process.env.ORIGIN_URL)) {
        return res.status(403).json({ message: 'Não permitido' });
    }
    next();
}
const csrfProtection = csrf({ cookie: true });
app.use(cookieParser());

app.get('/csrf-token', csrfProtection, (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken(), { httpOnly: true, secure: true });
    res.json({ csrfToken: req.csrfToken() });
});

app.post('/proxy-login',loginLimiter, speedLimiter, verifyOrigin, csrfProtection, async (req, res) => {
    const { username, password } = req.body;

    // Validação e sanitização
    if (!validator.isAlphanumeric(username) || !validator.isLength(username, { min: 3, max: 30 })) {
        return res.status(401).json({ message: 'Invalid username' });
    }
    if (!validator.isLength(password, { min: 6 })) {
        return res.status(401).json({ message: 'Invalid password' });
    }

    const payload = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    const hmac = crypto.createHmac('sha256', hmacKey);
    const digest = hmac.update(payload).digest('hex');

    try {
        const response = await axios.post(process.env.ORIGIN_URL + '/api/v1/login', payload, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'CertQuiz',
                'x-api-key': apiKey,
                'x-signature': digest,
            },
        });
        
        res.status(response.status).json(response.data);
    } catch (error) {
        console.log(error);
        if (error.response) {
            // O servidor respondeu com um status fora do intervalo 2xx
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            // A requisição foi feita mas não houve resposta
            res.status(500).json({ message: 'No response received from server' });
        } else {
            // Algo aconteceu ao configurar a requisição que acionou um erro
            res.status(500).json({ message: 'Error in setting up the request' });
        }
    }
});


app.post('/api/v1/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { username, password: hashedPassword };
    await app.locals.database.collection('users').insertOne(user);
    res.status(201).json({ message: 'Usuário registrado com sucesso' });
});

function verifySignature(req, res, next) {
    const signature = req.headers['x-signature'];
    const apiKeyHeader = req.headers['x-api-key'];
    const userAgent = req.headers['user-agent'];

    if (apiKeyHeader !== apiKey || userAgent !== 'CertQuiz') {
        return res.status(403).json({ message: 'Acesso negado' });
    }

    const payload = new URLSearchParams(req.body).toString();
    const hmac = crypto.createHmac('sha256', hmacKey);
    const digest = hmac.update(payload).digest('hex');

    if (signature !== digest) {
        return res.status(403).json({ message: 'Assinatura inválida' });
    }

    next();
}

app.post('/api/v1/login',loginLimiter, speedLimiter,express.urlencoded({ extended: true }), verifySignature, async (req, res) => {
    const { username, password } = req.body;
    
    // Validação e sanitização
      if (!validator.isAlphanumeric(username) || !validator.isLength(username, { min: 3, max: 30 })) {
        return res.status(401).json({ message: 'Invalid username' });
    }
    if (!validator.isLength(password, { min: 6 })) {
        return res.status(401).json({ message: 'Invalid password' });
    }

    const user = await app.locals.database.collection('users').findOne({ username });
    if (!user) {
        return res.status(401).json({ message: 'Usuário e/ou senha incorreta.' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Usuário e/ou senha incorreta' });
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
