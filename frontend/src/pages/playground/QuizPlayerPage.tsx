import { Badge, Button, Group, Radio, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { Panel } from '../../components/Panel';
import { api } from '../../lib/api';
import { useSession } from '../../state/session';

export function QuizPlayerPage() {
  const { session } = useSession();
  const { examId = '', quizIndex = '0' } = useParams();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<{ correctAnswers: number; totalQuestions: number } | null>(null);
  const queryClient = useQueryClient();

  const examsQuery = useQuery({
    queryKey: ['exams', 'resolver'],
    queryFn: () => api.listExams(session, 1, 100)
  });
  const exam = examsQuery.data?.exams.find((item) => item.id === examId);
  const parsedIndex = Number(quizIndex);
  const quizQuery = useQuery({
    queryKey: ['quiz-by-index', exam?.title, parsedIndex],
    queryFn: () => api.getQuizByIndex(session, exam!.title, parsedIndex),
    enabled: Boolean(exam?.title)
  });

  const totalQuestions = quizQuery.data?.questions.length || 0;
  const correctAnswers = useMemo(() => {
    if (!quizQuery.data) return 0;
    return quizQuery.data.questions.reduce((acc, question, questionIndex) => {
      const selected = answers[questionIndex];
      if (selected === undefined) return acc;
      return question.options[selected]?.correct ? acc + 1 : acc;
    }, 0);
  }, [answers, quizQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      api.saveQuizResult(session, {
        userId: session!.uid,
        examId,
        quizIndex: parsedIndex,
        correctAnswers,
        totalQuestions
      }),
    onSuccess: (data) => {
      setResult({ correctAnswers, totalQuestions });
      notifications.show({ color: 'teal', message: data.message || 'Resultado salvo' });
      queryClient.invalidateQueries({ queryKey: ['results'] });
    },
    onError: (error: Error) => notifications.show({ color: 'red', message: error.message })
  });

  const pointsMutation = useMutation({
    mutationFn: () => api.updatePoints(session, { userId: session!.uid, pontos: correctAnswers }),
    onSuccess: (data) => notifications.show({ color: 'teal', message: `Pontos atualizados. Nível atual: ${data.nivel || '-'}` }),
    onError: (error: Error) => notifications.show({ color: 'red', message: error.message })
  });

  return (
    <Stack gap="lg">
      <PageHeader eyebrow="Quiz Player" title={quizQuery.data?.title || 'Quiz'} subtitle="Busca via endpoint de quiz por índice e registra o resultado no backend." aside={<Badge size="lg">{exam?.title || 'Carregando exame'}</Badge>} />

      <Panel className="hero-panel">
        <Stack>
          {(quizQuery.data?.questions || []).map((question, questionIndex) => (
            <Panel key={`${questionIndex}`} className="glass-card">
              <Stack>
                <Title order={4}>{questionIndex + 1}. {question.question}</Title>
                <Radio.Group value={answers[questionIndex]?.toString()} onChange={(value) => setAnswers((current) => ({ ...current, [questionIndex]: Number(value) }))}>
                  <Stack gap="xs">
                    {question.options.map((option, optionIndex) => (
                      <Radio key={`${questionIndex}-${optionIndex}`} value={String(optionIndex)} label={option.text} />
                    ))}
                  </Stack>
                </Radio.Group>
              </Stack>
            </Panel>
          ))}
        </Stack>
      </Panel>

      <Group>
        <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>
          Finalizar e salvar resultado
        </Button>
        <Button variant="light" color="orange" onClick={() => pointsMutation.mutate()} loading={pointsMutation.isPending}>
          Converter acertos em pontos
        </Button>
      </Group>

      {result ? (
        <Panel>
          <Title order={3}>Resultado local</Title>
          <Text>{result.correctAnswers} de {result.totalQuestions} corretas</Text>
        </Panel>
      ) : null}
    </Stack>
  );
}
