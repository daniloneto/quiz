import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs/promises';
import { forwardToBackend } from '../../../lib/frontend-proxy';

export const config = {
  api: {
    bodyParser: false
  }
};

async function parseMultipart(req: NextApiRequest) {
  const form = formidable({ multiples: false });
  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    form.parse(req, (error, fields, files) => {
      if (error) reject(error);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { fields, files } = await parseMultipart(req);
    const firstFileKey = Object.keys(files)[0];
    if (!firstFileKey) {
      return res.status(400).json({ message: 'No files were uploaded.' });
    }

    const input = files[firstFileKey];
    const file = Array.isArray(input) ? input[0] : input;
    if (!file?.filepath) {
      return res.status(400).json({ message: 'Uploaded file missing path' });
    }

    const buffer = await fs.readFile(file.filepath);
    const formData = new FormData();
    formData.append('file', new Blob([buffer]), file.originalFilename || 'upload.txt');

    for (const [key, value] of Object.entries(fields)) {
      const normalized = Array.isArray(value) ? value[0] : value;
      if (normalized != null) {
        formData.append(key, String(normalized));
      }
    }

    return forwardToBackend(req, res, {
      targetPath: '/api/v1/upload/gpt-integration',
      method: 'POST',
      body: formData,
      contentType: null,
      requireAuth: true
    });
  } catch (error) {
    console.error('Frontend upload proxy failed:', error);
    return res.status(500).json({ message: 'Erro ao processar upload no proxy' });
  }
}
