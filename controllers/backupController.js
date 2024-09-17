const fs = require('fs');
const path = require('path');

async function createBackup(req, res) {
    try {
        const collection = req.app.locals.database.collection('exams');
        const exams = await collection.find({}).toArray();

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(__dirname, `../local/backup-${timestamp}.json`);

        fs.writeFileSync(backupPath, JSON.stringify(exams, null, 2), 'utf-8');

        res.status(200).send("Sucesso");
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao fazer backup');
    }
}

module.exports = { createBackup };
