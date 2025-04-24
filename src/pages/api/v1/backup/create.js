import fs from 'fs';
import path from 'path';
import logger from '../../../../config/logger';
import { connectToDatabase } from '../../../../config/database';
import MongoExamRepository from '../../../../infrastructure/database/MongoExamRepository';
import FindAllExamsUseCase from '../../../../application/usecases/FindAllExamsUseCase';

/**
 * API route handler for creating backups
 */
export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await connectToDatabase();
    const repository = new MongoExamRepository(db);
    const findAllExamsUseCase = new FindAllExamsUseCase({ examRepository: repository });
    const exams = await findAllExamsUseCase.execute();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    console.log(__dirname);
    const backupPath = path.join(__dirname, `../../../../../../../backup-${timestamp}.json`);

    fs.writeFileSync(backupPath, JSON.stringify(exams, null, 2), 'utf-8');
    
    return res.status(200).send('Sucesso');
  } catch(err) { 
    logger.error('Erro ao fazer backup:', err);
    res.status(500).send('Erro ao fazer backup');
  }
}