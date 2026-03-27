import { Grid, Stack, Text, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../components/PageHeader';
import { Panel } from '../components/Panel';
import { ApiError, api } from '../lib/api';
import { useSession } from '../state/session';

export function ProfilePage() {
  const { session } = useSession();

  const profileQuery = useQuery({
    queryKey: ['profile', session?.uid],
    queryFn: () => api.getProfile(session, session!.uid),
    enabled: Boolean(session?.uid)
  });

  const levelsQuery = useQuery({
    queryKey: ['levels'],
    queryFn: () => api.getLevels(session),
    retry: false
  });

  const resultsQuery = useQuery({
    queryKey: ['results', session?.uid],
    queryFn: async () => {
      try {
        return await api.getQuizResults(session, session!.uid);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return [];
        }
        throw error;
      }
    },
    enabled: Boolean(session?.uid),
    retry: false
  });

  return (
    <Stack gap="lg">
      <PageHeader
        eyebrow="Perfil"
        title="Perfil e progresso"
        subtitle="Integra perfil, níveis e histórico de resultados enriquecido com título do exame."
      />

      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Panel className="hero-panel">
            <Title order={3} mb="sm">
              Conta
            </Title>
            <Text fw={600}>{profileQuery.data?.nome}</Text>
            <Text c="dimmed">{profileQuery.data?.email}</Text>
            <Text mt="md">Pontos: {profileQuery.data?.pontos ?? '-'}</Text>
            <Text>Nível: {profileQuery.data?.nivel ?? '-'}</Text>
          </Panel>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          <Panel>
            <Title order={3} mb="sm">
              Faixas de nível
            </Title>
            <Stack gap="xs">
              {(levelsQuery.data || []).map((level) => (
                <Text key={level.nivel}>
                  Nível {level.nivel}: {level.pontos} até {level.limiteSuperior} pontos
                </Text>
              ))}
            </Stack>
          </Panel>
        </Grid.Col>
      </Grid>

      <Panel>
        <Title order={3} mb="sm">
          Histórico de resultados
        </Title>
        <Stack gap="md">
          {resultsQuery.data?.length === 0 ? (
            <Text c="dimmed">Nenhum resultado salvo para este usuário ainda.</Text>
          ) : null}

          {(resultsQuery.data || []).map((result, resultIndex) => (
            <Panel key={`${result.examId}-${resultIndex}`} className="glass-card">
              <Title order={4}>{result.examTitle || result.examId}</Title>
              {result.quizzes.map((quiz, quizIndex) => (
                <div key={`${result.examId}-${quizIndex}`}>
                  <Text fw={600}>Quiz #{quiz.quizIndex}</Text>
                  {quiz.answers.map((answer, answerIndex) => (
                    <Text key={`${quiz.quizIndex}-${answerIndex}`} c="dimmed">
                      {answer.correctAnswers}/{answer.totalQuestions} em {new Date(answer.date).toLocaleString()}
                    </Text>
                  ))}
                </div>
              ))}
            </Panel>
          ))}
        </Stack>
      </Panel>
    </Stack>
  );
}
