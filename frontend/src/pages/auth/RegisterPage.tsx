import { Button, Container, Stack, Text, TextInput, Title } from '@mantine/core';
import { zodResolver } from '@hookform/resolvers/zod';
import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { Panel } from '../../components/Panel';
import { api } from '../../lib/api';

const schema = z.object({
  username: z.string().min(1, 'Informe o usuário'),
  nome: z.string().min(1, 'Informe o nome'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Use pelo menos 6 caracteres')
});

type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const form = useForm<FormData>({ resolver: zodResolver(schema) });
  const mutation = useMutation({
    mutationFn: api.register,
    onSuccess: (data) => notifications.show({ color: 'teal', message: data.message || 'Registro enviado' }),
    onError: (error: Error) => notifications.show({ color: 'red', message: error.message })
  });

  return (
    <Container size="sm" py={48}>
      <Panel className="hero-panel">
        <Stack>
          <div>
            <Title order={1}>Registrar nova conta</Title>
            <Text c="dimmed">Crie sua conta no Quizz Game Studio.</Text>
          </div>
          <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <Stack>
              <TextInput label="Usuário" {...form.register('username')} error={form.formState.errors.username?.message} />
              <TextInput label="Nome" {...form.register('nome')} error={form.formState.errors.nome?.message} />
              <TextInput label="E-mail" {...form.register('email')} error={form.formState.errors.email?.message} />
              <TextInput label="Senha" type="password" {...form.register('password')} error={form.formState.errors.password?.message} />
              <Button type="submit" loading={mutation.isPending}>
                Registrar
              </Button>
              <Text size="sm" c="dimmed">
                Já tem conta? <Link to="/auth/login">Voltar para login</Link>
              </Text>
            </Stack>
          </form>
        </Stack>
      </Panel>
    </Container>
  );
}
