import fs from 'fs/promises';
import path from 'path';

function toRoute(apiDir: string, filePath: string) {
  let rel = path.relative(apiDir, filePath);
  rel = rel.replace(/\\/g, '/');
  rel = rel.replace(/\.(t|j)sx?$/i, '');
  // remove /index at end
  rel = rel.replace(/\/index$/i, '');
  if (!rel.startsWith('/')) rel = '/' + rel;
  // convert [param] -> {param}, [...param] -> {param}
  rel = rel.replace(/\[\.\.\.(.+?)\]/g, '{$1}');
  rel = rel.replace(/\[(.+?)\]/g, '{$1}');
  return '/api' + rel;
}

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (/\.(js|ts|tsx|jsx|cjs|mjs)$/.test(e.name)) {
      files.push(full);
    }
  }
  return files;
}

function detectMethods(content: string): string[] {
  const methods = new Set<string>();
  const regex1 = /req\.method\s*===\s*['\"]([A-Z]+)['\"]/g;
  let m;
  while ((m = regex1.exec(content))) methods.add(m[1].toLowerCase());

  const regex2 = /case\s+['\"]([A-Z]+)['\"]/g;
  while ((m = regex2.exec(content))) methods.add(m[1].toLowerCase());

  // common helper checks like if (method === 'POST')
  const regex3 = /\bmethod\s*[=:]\s*['\"]([A-Z]+)['\"]/g;
  while ((m = regex3.exec(content))) methods.add(m[1].toLowerCase());

  if (methods.size === 0) {
    // default to get if nothing obvious
    methods.add('get');
  }

  return Array.from(methods);
}

export async function generateOpenApi() {
  const apiDir = path.join(process.cwd(), 'src', 'pages', 'api');
  const files = await walk(apiDir).catch(() => []);

  const paths: Record<string, any> = {};

  for (const file of files) {
    const route = toRoute(apiDir, file);
    let content = '';
    try {
      content = await fs.readFile(file, 'utf-8');
    } catch (e) {
      continue;
    }

    const methods = detectMethods(content);
    if (!paths[route]) paths[route] = {};
    for (const m of methods) {
      paths[route][m] = {
        summary: `${m.toUpperCase()} for ${route}`,
        responses: { '200': { description: 'OK' } }
      };
    }
  }

  const spec = {
    openapi: '3.0.3',
    info: { title: 'Quizz API (auto-generated)', version: '1.0.0' },
    servers: [{ url: 'http://localhost:3000' }],
    paths
  };

  return spec;
}

export default generateOpenApi;
