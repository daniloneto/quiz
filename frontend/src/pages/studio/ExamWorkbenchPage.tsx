import { Accordion, Badge, Button, Divider, Grid, Group, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { zodResolver } from '@hookform/resolvers/zod';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { z } from 'zod';
import { PageHeader } from '../../components/PageHeader';
import { Panel } from '../../components/Panel';
import { api } from '../../lib/api';
import { useSession } from '../../state/session';

const quizSchema = z.object({
  title: z.string().min(1, 'Informe o título do quiz')
});

const questionSchema = z.object({
  quiz: z.string().min(1, 'Selecione o quiz'),
  question: z.string().min(1, 'Informe a pergunta'),
  optionA: z.string().min(1),
  optionB: z.string().min(1),
  optionC: z.string().min(1),
  optionD: z.string().min(1),
  correctOption: z.string().min(1)
});

type QuizFormData = z.infer<typeof quizSchema>;
type QuestionFormData = z.infer<typeof questionSchema>;

export function ExamWorkbenchPage() {
  const { examId = '' } = useParams();
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [editBuffer, setEditBuffer] = useState<Record<string, string>>({});
  const examsQuery = useQuery({
    queryKey: ['exams', 'catalog'],
    queryFn: () => api.listExams(session, 1, 100)
  });
  const quizzesQuery = useQuery({
    queryKey: ['quizzes', examId],
    queryFn: () => api.getQuizzesByExam(session, examId),
    enabled: Boolean(examId)
  });

  const exam = examsQuery.data?.exams.find((item) => item.id === examId);
  const quizForm = useForm<QuizFormData>({ resolver: zodResolver(quizSchema) });
  const questionForm = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: { correctOption: 'A' }
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['exams'] });
    queryClient.invalidateQueries({ queryKey: ['quizzes', examId] });
  };

  const createQuizMutation = useMutation({
    mutationFn: (values: QuizFormData) => api.createQuiz(session, { examTitle: exam?.title || '', quiz: { title: values.title, questions: [] } }),
    onSuccess: (data) => {
      notifications.show({ color: 'teal', message: data.message || 'Quiz criado' });
      quizForm.reset();
      refresh();
    },
    onError: (error: Error) => notifications.show({ color: 'red', message: error.message })
  });

  const addQuestionMutation = useMutation({
    mutationFn: (values: QuestionFormData) => api.addQuestion(session, { ...values, exam: exam?.title || '' }),
    onSuccess: (data) => {
      notifications.show({ color: 'teal', message: data.message || 'Pergunta criada' });
      questionForm.reset({ correctOption: 'A' });
      refresh();
    },
    onError: (error: Error) => notifications.show({ color: 'red', message: error.message })
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { examId: string; quizIndex: number; questionIndex: number; optionIndex?: number; newValue: string }) =>
      api.updateQuestion(session, payload),
    onSuccess: (data) => {
      notifications.show({ color: 'teal', message: data.message || 'Pergunta atualizada' });
      refresh();
    },
    onError: (error: Error) => notifications.show({ color: 'red', message: error.message })
  });

  const deleteMutation = useMutation({
    mutationFn: (payload: { examId: string; quizIndex: number; questionIndex: number }) =>
      api.deleteQuestion(session, payload),
    onSuccess: (data) => {
      notifications.show({ color: 'teal', message: data.message || 'Pergunta removida' });
      refresh();
    },
    onError: (error: Error) => notifications.show({ color: 'red', message: error.message })
  });

  const quizOptions = useMemo(() => (quizzesQuery.data || []).map((quiz) => ({ label: quiz.title, value: quiz.title })), [quizzesQuery.data]);

  return (
    <Stack gap="lg">
      <PageHeader
        eyebrow="Workbench"
        title={exam?.title || 'Exame'}
        subtitle="Criar quizzes, adicionar perguntas e editar cada texto ou opção inline."
        aside={<Badge size="lg">{quizzesQuery.data?.length || 0} quizzes</Badge>}
      />

      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack>
            <Panel className="hero-panel">
              <Title order={3} mb="md">Novo quiz</Title>
              <form onSubmit={quizForm.handleSubmit((values) => createQuizMutation.mutate(values))}>
                <Stack>
                  <TextInput label="Título do quiz" {...quizForm.register('title')} error={quizForm.formState.errors.title?.message} />
                  <Button type="submit" loading={createQuizMutation.isPending} disabled={!exam}>
                    Criar quiz
                  </Button>
                </Stack>
              </form>
            </Panel>

            <Panel>
              <Title order={3} mb="md">Adicionar pergunta</Title>
              <form onSubmit={questionForm.handleSubmit((values) => addQuestionMutation.mutate(values))}>
                <Stack>
                  <Controller
                    control={questionForm.control}
                    name="quiz"
                    render={({ field }) => <Select label="Quiz" data={quizOptions} {...field} error={questionForm.formState.errors.quiz?.message} />}
                  />
                  <TextInput label="Pergunta" {...questionForm.register('question')} error={questionForm.formState.errors.question?.message} />
                  <TextInput label="Opção A" {...questionForm.register('optionA')} />
                  <TextInput label="Opção B" {...questionForm.register('optionB')} />
                  <TextInput label="Opção C" {...questionForm.register('optionC')} />
                  <TextInput label="Opção D" {...questionForm.register('optionD')} />
                  <Controller
                    control={questionForm.control}
                    name="correctOption"
                    render={({ field }) => <Select label="Opção correta" data={['A', 'B', 'C', 'D']} {...field} error={questionForm.formState.errors.correctOption?.message} />}
                  />
                  <Button type="submit" loading={addQuestionMutation.isPending} disabled={!exam}>
                    Inserir pergunta
                  </Button>
                </Stack>
              </form>
            </Panel>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          <Panel>
            <Title order={3} mb="sm">Quizzes e questões</Title>
            <Accordion variant="separated" radius="lg">
              {(quizzesQuery.data || []).map((quiz, quizIndex) => (
                <Accordion.Item key={`${quiz.title}-${quizIndex}`} value={`${quiz.title}-${quizIndex}`}>
                  <Accordion.Control>
                    <Text fw={600}>{quiz.title} · {(quiz.questions || []).length} perguntas</Text>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Stack>
                      {(quiz.questions || []).map((question, questionIndex) => (
                        <Panel key={`${quizIndex}-${questionIndex}`} className="glass-card">
                          <Stack>
                            <Text size="sm" c="dimmed">Questão {questionIndex + 1}</Text>
                            <Group align="flex-end">
                              <TextInput
                                style={{ flex: 1 }}
                                label="Texto"
                                value={editBuffer[`question-${quizIndex}-${questionIndex}`] ?? question.question}
                                onChange={(event) =>
                                  setEditBuffer((current) => ({
                                    ...current,
                                    [`question-${quizIndex}-${questionIndex}`]: event.currentTarget.value
                                  }))
                                }
                              />
                              <Button
                                onClick={() =>
                                  updateMutation.mutate({
                                    examId,
                                    quizIndex,
                                    questionIndex,
                                    newValue: editBuffer[`question-${quizIndex}-${questionIndex}`] ?? question.question
                                  })
                                }
                              >
                                Salvar texto
                              </Button>
                            </Group>
                            <Divider />
                            {question.options.map((option, optionIndex) => (
                              <Group key={`${quizIndex}-${questionIndex}-${optionIndex}`} align="flex-end">
                                <TextInput
                                  style={{ flex: 1 }}
                                  label={`Opção ${optionIndex + 1}${option.correct ? ' • correta' : ''}`}
                                  value={editBuffer[`option-${quizIndex}-${questionIndex}-${optionIndex}`] ?? option.text}
                                  onChange={(event) =>
                                    setEditBuffer((current) => ({
                                      ...current,
                                      [`option-${quizIndex}-${questionIndex}-${optionIndex}`]: event.currentTarget.value
                                    }))
                                  }
                                />
                                <Button
                                  variant="light"
                                  onClick={() =>
                                    updateMutation.mutate({
                                      examId,
                                      quizIndex,
                                      questionIndex,
                                      optionIndex,
                                      newValue: editBuffer[`option-${quizIndex}-${questionIndex}-${optionIndex}`] ?? option.text
                                    })
                                  }
                                >
                                  Salvar opção
                                </Button>
                              </Group>
                            ))}
                            <Button color="red" variant="subtle" onClick={() => deleteMutation.mutate({ examId, quizIndex, questionIndex })}>
                              Excluir pergunta
                            </Button>
                          </Stack>
                        </Panel>
                      ))}
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </Panel>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
