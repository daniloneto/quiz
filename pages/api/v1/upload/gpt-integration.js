import formidable from 'formidable';
import fs from 'fs';
import { connectToDatabase } from '../../../../config/database';
import uploadController from '../../../../controllers/uploadController';
import { verifyApiKey, authenticateToken } from '../../../../lib/middleware';

// Disable Next.js default body parser to handle multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  // Parse multipart/form-data
  const form = formidable({ multiples: false });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form data:', err);
      return res.status(500).json({ message: 'Error parsing form data' });
    }
    // Map fields to req.body
    req.body = {
      numQuestions: parseInt(fields.numQuestions, 10),
      quizTitle: fields.quizTitle,
      examTitle: fields.examTitle,
      lingua: fields.lingua,
    };
    // Read uploaded file into buffer
    const fileField = files.file;
    if (!fileField) {
      return res.status(400).json({ message: 'No files were uploaded.' });
    }
    const filePath = fileField.filepath || fileField.path;
    try {
      const dataBuffer = await fs.promises.readFile(filePath);
      req.files = { file: { data: dataBuffer } };
    } catch (readErr) {
      console.error('Error reading uploaded file:', readErr);
      return res.status(500).json({ message: 'Error reading uploaded file' });
    }
    // Attach database
    const db = await connectToDatabase();
    req.app = { locals: { database: db } };
    // Authenticate
    if (!verifyApiKey(req, res) || !authenticateToken(req, res)) return;
    // Delegate to controller
    return uploadController.processUpload(req, res);
  });
}