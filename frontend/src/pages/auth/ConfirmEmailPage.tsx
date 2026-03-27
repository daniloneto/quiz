import { Button, Container, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Panel } from '../../components/Panel';
import { api } from '../../lib/api';

export function ConfirmEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  const mutation = useMutation({
    mutationFn: () => api.confirmEmail(token),
    onSuccess: (data) => notifications.show({ color: 'teal', message: data.message || 'Conta confirmada' }),
    onError: (error: Error) => {
      console.error('Confirm email failed:', error);
      notifications.show({ color: 'red', message: 'Erro ao confirmar conta. Tente novamente.' });
    }
  });

  return (
    <Container size="sm" py={48}>
      <Panel className="hero-panel">
        <Stack>
          <div>
            <Title order={1}>Confirmar e-mail</Title>
            <Text c="dimmed">Executa a ação pública de ativação de conta com token de querystring.</Text>
          </div>
          <Button onClick={() => mutation.mutate()} loading={mutation.isPending} disabled={!token}>
            Confirmar conta
          </Button>
          {!token ? <Text c="red">Nenhum token encontrado na URL.</Text> : null}
        </Stack>
      </Panel>
    </Container>
  );
}
