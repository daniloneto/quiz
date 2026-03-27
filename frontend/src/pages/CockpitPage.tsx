import { Badge, Button, Grid, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Panel } from '../components/Panel';
import { api } from '../lib/api';
import { useSession } from '../state/session';

export function CockpitPage() {
  const { session } = useSession();
  const examsQuery = useQuery({
    queryKey: ['exams', 'dashboard'],
    queryFn: () => api.listExams(session, 1, 50)
  });
  const profileQuery = useQuery({
    queryKey: ['profile', session?.uid],
    queryFn: () => api.getProfile(session, session!.uid),
    enabled: Boolean(session?.uid)
  });
  const protectedQuery = useQuery({
    queryKey: ['protected-check'],
    queryFn: () => api.protectedCheck(session)
  });

  const examCount = examsQuery.data?.total || 0;
  const quizCount = examsQuery.data?.exams.reduce((acc, exam) => acc + (exam.quizzes?.length || 0), 0) || 0;

  return (
    <Stack gap="lg">
      <PageHeader
        eyebrow="Cockpit"
        title="Painel de comando"
        subtitle="Uma leitura rápida do estado operacional do produto e da sua sessão."
        aside={
          <Group>
            <Button component={Link} to="/studio/exams" variant="light">
              Abrir Studio
            </Button>
            <Button component={Link} to="/playground">
              Ir para Playground
            </Button>
          </Group>
        }
      />

      <SimpleGrid cols={{ base: 1, md: 3 }}>
        <Panel className="hero-panel">
          <Text c="dimmed">Exames catalogados</Text>
          <Title order={2}>{examCount}</Title>
        </Panel>
        <Panel className="hero-panel">
          <Text c="dimmed">Quizzes mapeados</Text>
          <Title order={2}>{quizCount}</Title>
        </Panel>
        <Panel className="hero-panel">
          <Text c="dimmed">Status protegido</Text>
          <Badge color={protectedQuery.isError ? 'red' : 'teal'} size="lg">
            {protectedQuery.isError ? 'falhou' : 'ok'}
          </Badge>
        </Panel>
      </SimpleGrid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Panel>
            <Title order={3} mb="sm">
              Atalhos principais
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <Panel className="glass-card">
                <Text fw={600}>Studio editorial</Text>
                <Text c="dimmed" size="sm" mb="md">
                  Criar exames, modelar quizzes, ajustar questões e disparar IA.
                </Text>
                <Button component={Link} to="/studio/exams">
                  Operar conteúdo
                </Button>
              </Panel>
              <Panel className="glass-card">
                <Text fw={600}>Playground</Text>
                <Text c="dimmed" size="sm" mb="md">
                  Selecionar provas, jogar quizzes, salvar resultados e medir pontos.
                </Text>
                <Button component={Link} to="/playground" color="orange">
                  Jogar agora
                </Button>
              </Panel>
            </SimpleGrid>
          </Panel>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Panel>
            <Title order={3} mb="sm">
              Perfil ativo
            </Title>
            <Text fw={600}>{profileQuery.data?.nome || '...'}</Text>
            <Text c="dimmed">{profileQuery.data?.email || 'Carregando perfil'}</Text>
            <Text mt="md">Pontos: {profileQuery.data?.pontos ?? '-'}</Text>
            <Text>Nível: {profileQuery.data?.nivel ?? '-'}</Text>
          </Panel>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
