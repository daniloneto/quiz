import { Button, Container, Stack, Text, TextInput, Title } from '@mantine/core';
import { zodResolver } from '@hookform/resolvers/zod';
import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Panel } from '../../components/Panel';
import { api } from '../../lib/api';

const schema = z.object({
  email: z.string().email('E-mail inválido')
});

type FormData = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const form = useForm<FormData>({ resolver: zodResolver(schema) });
  const mutation = useMutation({
    mutationFn: api.forgotPassword,
    onSuccess: (data) => notifications.show({ color: 'teal', message: data.message || 'Solicitação enviada' }),
    onError: (error: Error) => notifications.show({ color: 'red', message: error.message })
  });

  return (
    <Container size="sm" py={48}>
      <Panel className="hero-panel">
        <Stack>
          <div>
            <Title order={1}>Recuperar senha</Title>
            <Text c="dimmed">Solicita ao backend o envio do e-mail de redefinição.</Text>
          </div>
          <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <Stack>
              <TextInput label="E-mail" {...form.register('email')} error={form.formState.errors.email?.message} />
              <Button type="submit" loading={mutation.isPending}>
                Enviar
              </Button>
            </Stack>
          </form>
        </Stack>
      </Panel>
    </Container>
  );
}
