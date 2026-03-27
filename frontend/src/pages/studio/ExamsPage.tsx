import { Button, Grid, Pagination, SimpleGrid, Stack, Text, TextInput, Textarea, Title } from '@mantine/core';
import { zodResolver } from '@hookform/resolvers/zod';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { PageHeader } from '../../components/PageHeader';
import { Panel } from '../../components/Panel';
import { api } from '../../lib/api';
import { useSession } from '../../state/session';

const schema = z.object({
  title: z.string().min(1, 'Informe o título'),
  description: z.string().optional()
});

type FormData = z.infer<typeof schema>;

export function ExamsPage() {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  const examsQuery = useQuery({
    queryKey: ['exams', page],
    queryFn: () => api.listExams(session, page, 9)
  });

  const createMutation = useMutation({
    mutationFn: (values: FormData) => api.createExam(session, values),
    onSuccess: (data) => {
      notifications.show({ color: 'teal', message: data.message || 'Exame criado' });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
    onError: (error: Error) => notifications.show({ color: 'red', message: error.message })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteExam(session, id),
    onSuccess: (data) => {
      notifications.show({ color: 'teal', message: data.message || 'Exame removido' });
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
    onError: (error: Error) => notifications.show({ color: 'red', message: error.message })
  });

  return (
    <Stack gap="lg">
      <PageHeader
        eyebrow="Studio"
        title="Explorador de exames"
        subtitle="Criação, paginação, exclusão e acesso ao workbench de quizzes."
      />

      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Panel className="hero-panel">
            <Title order={3} mb="md">
              Novo exame
            </Title>
            <form onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}>
              <Stack>
                <TextInput label="Título" {...form.register('title')} error={form.formState.errors.title?.message} />
                <Textarea label="Descrição" minRows={4} {...form.register('description')} />
                <Button type="submit" loading={createMutation.isPending}>
                  Criar exame
                </Button>
              </Stack>
            </form>
          </Panel>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }}>
            {examsQuery.data?.exams.map((exam) => (
              <Panel key={exam.id}>
                <Text c="dimmed" size="sm">
                  {exam.createdAt ? new Date(exam.createdAt).toLocaleDateString() : 'sem data'}
                </Text>
                <Title order={4}>{exam.title}</Title>
                <Text c="dimmed" size="sm" lineClamp={3} mb="md">
                  {exam.description || 'Sem descrição'}
                </Text>
                <Text mb="md">Quizzes: {exam.quizzes?.length || 0}</Text>
                <Stack gap="xs">
                  <Button component={Link} to={`/studio/exams/${exam.id}`}>
                    Abrir workbench
                  </Button>
                  <Button variant="light" color="red" onClick={() => deleteMutation.mutate(exam.id)}>
                    Excluir exame
                  </Button>
                </Stack>
              </Panel>
            ))}
          </SimpleGrid>
          <Pagination mt="lg" value={page} onChange={setPage} total={examsQuery.data?.totalPages || 1} />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
