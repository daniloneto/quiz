import { NextApiRequest, NextApiResponse } from 'next';

type ProxyOptions = {
  targetPath: string;
  method?: string;
  body?: BodyInit | Record<string, unknown> | null;
  contentType?: string | null;
  requireAuth?: boolean;
  query?: Record<string, string | string[] | undefined>;
};

function getBaseUrl(req: NextApiRequest) {
  const protoHeader = req.headers['x-forwarded-proto'];
  const protocol = Array.isArray(protoHeader) ? protoHeader[0] : protoHeader || 'http';
  const host = req.headers.host || 'localhost:3000';
  return `${protocol}://${host}`;
}

function withQuery(url: URL, query?: Record<string, string | string[] | undefined>) {
  if (!query) return url;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        url.searchParams.append(key, item);
      }
      continue;
    }
    url.searchParams.set(key, value);
  }
  return url;
}

function buildHeaders(
  req: NextApiRequest,
  {
    contentType,
    requireAuth
  }: { contentType?: string | null; requireAuth?: boolean }
) {
  const headers = new Headers();
  if (process.env.API_KEY) {
    headers.set('x-api-key', process.env.API_KEY);
  }

  const authHeader = req.headers.authorization;
  if (authHeader) {
    headers.set('authorization', authHeader);
  } else if (requireAuth) {
    throw new Error('MISSING_AUTH');
  }

  if (contentType) {
    headers.set('content-type', contentType);
  }

  return headers;
}

async function writeProxyResponse(response: Response, res: NextApiResponse) {
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  res.status(response.status);
  if (contentType) {
    res.setHeader('Content-Type', contentType);
  }

  if (!text) {
    return res.end();
  }

  if (contentType.includes('application/json')) {
    try {
      return res.json(JSON.parse(text));
    } catch (error) {
      return res.status(502).json({ message: 'Invalid JSON from upstream service' });
    }
  }

  return res.send(text);
}

export async function forwardToBackend(req: NextApiRequest, res: NextApiResponse, options: ProxyOptions) {
  try {
    const method = options.method || req.method || 'GET';
    const targetUrl = withQuery(new URL(options.targetPath, getBaseUrl(req)), options.query);

    const isBodyInit =
      typeof FormData !== 'undefined' && options.body instanceof FormData ||
      typeof Blob !== 'undefined' && options.body instanceof Blob ||
      typeof URLSearchParams !== 'undefined' && options.body instanceof URLSearchParams ||
      typeof options.body === 'string';

    const body =
      method === 'GET' || method === 'HEAD'
        ? undefined
        : isBodyInit || options.body == null
          ? (options.body as BodyInit | undefined)
          : JSON.stringify(options.body);

    const response = await fetch(targetUrl, {
      method,
      headers: buildHeaders(req, {
        contentType: isBodyInit ? options.contentType || null : options.contentType || 'application/json',
        requireAuth: options.requireAuth
      }),
      body
    });

    return writeProxyResponse(response, res);
  } catch (error) {
    if (error instanceof Error && error.message === 'MISSING_AUTH') {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    console.error('Proxy forwarding failed:', error);
    return res.status(500).json({ message: 'Erro ao encaminhar requisição' });
  }
}

export function encodeSegments(segments: string[]) {
  return segments.map(segment => encodeURIComponent(segment)).join('/');
}
