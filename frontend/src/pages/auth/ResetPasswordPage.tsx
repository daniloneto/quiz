import { Button, Container, Stack, Text, TextInput, Title } from '@mantine/core';
import { zodResolver } from '@hookform/resolvers/zod';
import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { Panel } from '../../components/Panel';
import { api } from '../../lib/api';

const schema = z.object({
  token: z.string().min(1, 'Token obrigatório'),
  newPassword: z.string().min(6, 'Use pelo menos 6 caracteres')
});

type FormData = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { token: params.get('token') || '' }
  });
  const mutation = useMutation({
    mutationFn: api.resetPassword,
    onSuccess: (data) => notifications.show({ color: 'teal', message: data.message || 'Senha redefinida' }),
    onError: (error: Error) => notifications.show({ color: 'red', message: error.message })
  });

  return (
    <Container size="sm" py={48}>
      <Panel className="hero-panel">
        <Stack>
          <div>
            <Title order={1}>Resetar senha</Title>
            <Text c="dimmed">Aceita fluxo público com token sem exigir sessão.</Text>
          </div>
          <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <Stack>
              <TextInput label="Token" {...form.register('token')} error={form.formState.errors.token?.message} />
              <TextInput label="Nova senha" type="password" {...form.register('newPassword')} error={form.formState.errors.newPassword?.message} />
              <Button type="submit" loading={mutation.isPending}>
                Redefinir
              </Button>
            </Stack>
          </form>
        </Stack>
      </Panel>
    </Container>
  );
}
