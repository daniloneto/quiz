import api from './http';

export interface CrawlerPayload {
  urls: string[];
  numQuestions: number;
  quizTitle: string;
  examTitle: string;
  lingua: string;
}

export async function runCrawler(data: CrawlerPayload): Promise<unknown> {
  const response = await api.post('/crawler', data);
  return response.data;
}
