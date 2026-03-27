import { NextApiRequest, NextApiResponse } from 'next';
import { generateOpenApi } from '../../lib/openapi-generator';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const spec = await generateOpenApi();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(spec);
  } catch (err) {
    res.status(500).json({ error: 'failed to generate openapi spec' });
  }
}
