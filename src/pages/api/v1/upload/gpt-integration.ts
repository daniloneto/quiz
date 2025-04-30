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
  let fields, files;
  try {
    ({ fields, files } = await new Promise<any>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    }));
  } catch (err) {
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
  // Get the uploaded file (first file field)
  const fileKey = Object.keys(files)[0];
  if (!fileKey) {
    return res.status(400).json({ message: 'No files were uploaded.' });
  }
  // files[fileKey] may be an array or a single file
  let fileField = files[fileKey];
  if (Array.isArray(fileField)) {
    fileField = fileField[0];
  }
  if (!fileField || !fileField.filepath) {
    console.error('Uploaded file has no filepath:', fileField);
    return res.status(500).json({ message: 'Uploaded file missing path' });
  }
  const filepath = fileField.filepath;
  let dataBuffer;
  try {
    dataBuffer = await fs.promises.readFile(filepath);
  } catch (readErr) {
    console.error('Error reading uploaded file:', readErr);
    return res.status(500).json({ message: 'Error reading uploaded file' });
  }
  // Attach file buffer
  req.files = { file: { data: dataBuffer } };
  // Attach database
  const db = await connectToDatabase();
  req.app = { locals: { database: db } };
  // Authenticate
  if (!verifyApiKey(req, res) || !authenticateToken(req, res)) return;
  // Delegate to controller
  return uploadController.processUpload(req, res);
}