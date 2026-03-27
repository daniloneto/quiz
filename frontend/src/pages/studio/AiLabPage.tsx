import { Button, Grid, NumberInput, Stack, Tabs, Text, TextInput, Textarea, Title } from '@mantine/core';
import { zodResolver } from '@hookform/resolvers/zod';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { PageHeader } from '../../components/PageHeader';
import { Panel } from '../../components/Panel';
import { api } from '../../lib/api';
import { useSession } from '../../state/session';

const uploadSchema = z.object({
  examTitle: z.string().min(1),
  quizTitle: z.string().min(1),
  lingua: z.string().min(1),
  numQuestions: z.number().min(1).max(20)
});

const crawlSchema = uploadSchema.extend({
  urls: z.string().min(1)
});

type UploadFormData = z.infer<typeof uploadSchema>;
type CrawlFormData = z.infer<typeof crawlSchema>;

export function AiLabPage() {
  const { session } = useSession();
  const examsQuery = useQuery({
    queryKey: ['exams', 'ai'],
    queryFn: () => api.listExams(session, 1, 100)
  });
  const uploadForm = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { lingua: 'pt-BR', numQuestions: 5 }
  });
  const crawlForm = useForm<CrawlFormData>({
    resolver: zodResolver(crawlSchema),
    defaultValues: { lingua: 'pt-BR', numQuestions: 5 }
  });

  const uploadMutation = useMutation({
    mutationFn: async (values: UploadFormData & { file: File }) => {
      const formData = new FormData();
      formData.append('file', values.file);
      formData.append('examTitle', values.examTitle);
      formData.append('quizTitle', values.quizTitle);
      formData.append('lingua', values.lingua);
      formData.append('numQuestions', String(values.numQuestions));
      return api.uploadQuestions(session, formData);
    },
    onSuccess: () => notifications.show({ color: 'teal', message: 'Upload processado' }),
    onError: (error: Error) => notifications.show({ color: 'red', message: error.message })
  });

  const crawlMutation = useMutation({
    mutationFn: (values: CrawlFormData) =>
      api.crawlQuestions(session, {
        ...values,
        urls: values.urls.split('\n').map((line) => line.trim()).filter(Boolean)
      }),
    onSuccess: (data) =>
      notifications.show({ color: 'teal', message: `${data.message} (${data.questionCount || 0} questões)` }),
    onError: (error: Error) => notifications.show({ color: 'red', message: error.message })
  });

  return (
    <Stack gap="lg">
      <PageHeader eyebrow="AI Lab" title="Geração por IA" subtitle="Duas entradas para criação de conteúdo: arquivo base e crawling de URLs." />

      <Tabs defaultValue="upload">
        <Tabs.List>
          <Tabs.Tab value="upload">Upload</Tabs.Tab>
          <Tabs.Tab value="crawler">Crawler</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="upload" pt="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Panel className="hero-panel">
                <Title order={3} mb="md">
                  Importar arquivo e gerar quiz
                </Title>
                <form
                  onSubmit={uploadForm.handleSubmit((values) => {
                    const fileInput = document.getElementById('upload-file') as HTMLInputElement | null;
                    const file = fileInput?.files?.[0];
                    if (!file) {
                      notifications.show({ color: 'red', message: 'Selecione um arquivo antes de enviar' });
                      return;
                    }
                    uploadMutation.mutate({ ...values, file });
                  })}
                >
                  <Stack>
                    <TextInput label="Exame" {...uploadForm.register('examTitle')} />
                    <TextInput label="Novo quiz" {...uploadForm.register('quizTitle')} />
                    <TextInput label="Língua" {...uploadForm.register('lingua')} />
                    <Controller control={uploadForm.control} name="numQuestions" render={({ field }) => <NumberInput label="Perguntas" min={1} max={20} {...field} />} />
                    <input id="upload-file" type="file" accept=".txt,.md,.csv" />
                    <Button type="submit" loading={uploadMutation.isPending}>
                      Gerar do arquivo
                    </Button>
                  </Stack>
                </form>
              </Panel>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Panel>
                <Title order={3} mb="sm">
                  Exames disponíveis
                </Title>
                <Stack gap="xs">
                  {(examsQuery.data?.exams || []).map((exam) => (
                    <Text key={exam.id}>
                      {exam.title} · {exam.quizzes.length} quizzes
                    </Text>
                  ))}
                </Stack>
              </Panel>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="crawler" pt="md">
          <Panel>
            <Title order={3} mb="md">
              Web crawling assistido
            </Title>
            <form onSubmit={crawlForm.handleSubmit((values) => crawlMutation.mutate(values))}>
              <Grid>
                <Grid.Col span={{ base: 12, md: 3 }}>
                  <TextInput label="Exame" {...crawlForm.register('examTitle')} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 3 }}>
                  <TextInput label="Quiz" {...crawlForm.register('quizTitle')} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 3 }}>
                  <TextInput label="Língua" {...crawlForm.register('lingua')} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 3 }}>
                  <Controller control={crawlForm.control} name="numQuestions" render={({ field }) => <NumberInput label="Perguntas" min={1} max={20} {...field} />} />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Textarea label="URLs" minRows={8} placeholder="Uma URL por linha" {...crawlForm.register('urls')} />
                </Grid.Col>
              </Grid>
              <Button mt="md" type="submit" loading={crawlMutation.isPending}>
                Processar crawling
              </Button>
            </form>
          </Panel>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
