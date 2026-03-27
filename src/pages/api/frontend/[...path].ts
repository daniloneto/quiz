import { NextApiRequest, NextApiResponse } from 'next';
import { encodeSegments, forwardToBackend } from '../../../lib/frontend-proxy';

const publicAuthRoutes = new Set([
  'auth/register',
  'auth/login',
  'auth/forgot-password',
  'auth/reset-password',
  'auth/confirm-email'
]);

function resolveTarget(req: NextApiRequest) {
  const path = req.query.path;
  const segments = Array.isArray(path) ? path : path ? [path] : [];
  const routeKey = segments.join('/');

  if (publicAuthRoutes.has(routeKey)) {
    return {
      targetPath: `/api/v1/${routeKey}`,
      requireAuth: false,
      query: req.query
    };
  }

  if (routeKey === 'auth/protected') {
    return { targetPath: '/api/v1/auth/protected', requireAuth: true };
  }

  if (routeKey === 'exams') {
    return {
      targetPath: '/api/v1/exams',
      requireAuth: true,
      query: { page: req.query.page as string | undefined, limit: req.query.limit as string | undefined }
    };
  }

  if (segments[0] === 'exams' && segments.length === 2) {
    return {
      targetPath: `/api/v1/exams/${encodeSegments([segments[1]])}`,
      requireAuth: true
    };
  }

  if (segments[0] === 'exams' && segments[2] === 'quiz' && segments.length === 4) {
    return {
      targetPath: `/api/v1/exams/${encodeSegments([segments[1], 'quiz', segments[3]])}`,
      requireAuth: true
    };
  }

  if (routeKey === 'question') {
    return { targetPath: '/api/v1/question', requireAuth: true };
  }

  if (routeKey === 'quiz') {
    return { targetPath: '/api/v1/quiz', requireAuth: true };
  }

  if (segments[0] === 'quiz' && segments[1] === 'exam' && segments.length === 3) {
    return {
      targetPath: `/api/v1/quiz/exam/${encodeSegments([segments[2]])}`,
      requireAuth: true
    };
  }

  if (segments[0] === 'quiz' && segments[1] === 'results' && segments.length === 3) {
    return {
      targetPath: `/api/v1/quiz/quiz-results/${encodeSegments([segments[2]])}`,
      requireAuth: true
    };
  }

  if (routeKey === 'quiz/save-result') {
    return { targetPath: '/api/v1/quiz/save-quiz-result', requireAuth: true };
  }

  if (segments[0] === 'profile' && segments.length === 2) {
    return {
      targetPath: `/api/v1/profile/id/${encodeSegments([segments[1]])}`,
      requireAuth: true
    };
  }

  if (routeKey === 'profile/levels') {
    return { targetPath: '/api/v1/profile/levels', requireAuth: true };
  }

  if (routeKey === 'profile/update-points') {
    return { targetPath: '/api/v1/profile/atualizar-pontos', requireAuth: true };
  }

  if (routeKey === 'crawler') {
    return { targetPath: '/api/v1/crawler', requireAuth: true };
  }

  if (routeKey === 'backup/create') {
    return { targetPath: '/api/v1/backup/create', requireAuth: true };
  }

  if (routeKey === 'system/openapi') {
    return { targetPath: '/api/openapi.json', requireAuth: false };
  }

  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const resolved = resolveTarget(req);
  if (!resolved) {
    return res.status(404).json({ message: 'Rota frontend não encontrada' });
  }

  return forwardToBackend(req, res, {
    ...resolved,
    method: req.method,
    body: req.method === 'GET' || req.method === 'HEAD' ? null : req.body
  });
}
