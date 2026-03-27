import { Anchor, Button, Container, Group, PasswordInput, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { zodResolver } from '@hookform/resolvers/zod';
import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Panel } from '../../components/Panel';
import { api } from '../../lib/api';
import { useSession } from '../../state/session';

const schema = z.object({
  username: z.string().min(1, 'Informe o usuário'),
  password: z.string().min(1, 'Informe a senha'),
  loginType: z.string().min(1, 'Selecione o tipo')
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useSession();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { loginType: 'user' }
  });

  const mutation = useMutation({
    mutationFn: api.login,
    onSuccess: (session) => {
      setSession(session);
      notifications.show({ color: 'teal', message: 'Sessão iniciada com sucesso' });
      navigate((location.state as { from?: string } | undefined)?.from || '/');
    },
    onError: (error: Error) => notifications.show({ color: 'red', message: error.message })
  });

  return (
    <Container size="sm" py={48}>
      <Panel className="hero-panel">
        <Stack gap="lg">
          <div>
            <Title order={1}>Entrar no Control Room</Title>
            <Text c="dimmed">Acesso ao Studio e ao Playground com a mesma sessão JWT.</Text>
          </div>

          <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <Stack>
              <TextInput label="Usuário" {...form.register('username')} error={form.formState.errors.username?.message} />
              <PasswordInput label="Senha" {...form.register('password')} error={form.formState.errors.password?.message} />
              <Controller
                control={form.control}
                name="loginType"
                render={({ field }) => (
                  <Select
                    label="Perfil"
                    data={[
                      { label: 'User', value: 'user' },
                      { label: 'Admin', value: 'admin' }
                    ]}
                    {...field}
                    error={form.formState.errors.loginType?.message}
                  />
                )}
              />
              <Button type="submit" loading={mutation.isPending}>
                Entrar
              </Button>
            </Stack>
          </form>

          <Group justify="space-between">
            <Anchor component={Link} to="/auth/register">
              Criar conta
            </Anchor>
            <Anchor component={Link} to="/auth/forgot-password">
              Esqueci minha senha
            </Anchor>
          </Group>
        </Stack>
      </Panel>
    </Container>
  );
}
