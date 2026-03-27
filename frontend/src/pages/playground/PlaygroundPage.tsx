import { Button, Grid, Stack, Text, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { Panel } from '../../components/Panel';
import { api } from '../../lib/api';
import { useSession } from '../../state/session';

export function PlaygroundPage() {
  const { session } = useSession();
  const examsQuery = useQuery({
    queryKey: ['exams', 'playground'],
    queryFn: () => api.listExams(session, 1, 100)
  });

  return (
    <Stack gap="lg">
      <PageHeader eyebrow="Playground" title="Escolha um exame" subtitle="Fluxo do jogador: navegar entre exames e abrir um quiz para execução." />

      <Grid>
        {(examsQuery.data?.exams || []).map((exam) => (
          <Grid.Col key={exam.id} span={{ base: 12, md: 6, xl: 4 }}>
            <Panel className="hero-panel">
              <Title order={3}>{exam.title}</Title>
              <Text c="dimmed" size="sm" mb="md">
                {exam.description || 'Sem descrição'}
              </Text>
              <Text mb="md">{exam.quizzes.length} quizzes disponíveis</Text>
              {exam.quizzes.length > 0 ? (
                <Stack>
                  {exam.quizzes.map((quiz, index) => (
                    <Button key={`${exam.id}-${index}`} component={Link} variant={index === 0 ? 'filled' : 'light'} to={`/playground/exams/${exam.id}/quizzes/${index}`}>
                      Jogar {quiz.title || `Quiz ${index + 1}`}
                    </Button>
                  ))}
                </Stack>
              ) : (
                <Text c="dimmed">Nenhum quiz criado ainda.</Text>
              )}
            </Panel>
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
}
