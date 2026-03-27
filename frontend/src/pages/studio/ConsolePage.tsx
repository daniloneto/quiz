import { Button, Code, Group, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery } from '@tanstack/react-query';
import { PageHeader } from '../../components/PageHeader';
import { Panel } from '../../components/Panel';
import { api } from '../../lib/api';
import { useSession } from '../../state/session';

export function ConsolePage() {
  const { session } = useSession();
  const protectedQuery = useQuery({
    queryKey: ['console', 'protected'],
    queryFn: () => api.protectedCheck(session)
  });
  const openApiQuery = useQuery({
    queryKey: ['console', 'openapi'],
    queryFn: api.getOpenApi
  });
  const backupMutation = useMutation({
    mutationFn: () => api.createBackup(session),
    onSuccess: () => notifications.show({ color: 'teal', message: 'Backup disparado com sucesso' }),
    onError: (error: Error) => notifications.show({ color: 'red', message: error.message })
  });

  return (
    <Stack gap="lg">
      <PageHeader eyebrow="Console" title="Diagnóstico e sistema" subtitle="Protected check, OpenAPI e backup administrativo por proxy seguro." />

      <Group align="stretch">
        <Panel style={{ flex: 1 }}>
          <Title order={3} mb="sm">Protected route</Title>
          <Text>{protectedQuery.data?.message || protectedQuery.error?.message || 'Verificando...'}</Text>
        </Panel>
        <Panel style={{ flex: 1 }}>
          <Title order={3} mb="sm">Backup</Title>
          <Button onClick={() => backupMutation.mutate()} loading={backupMutation.isPending}>
            Executar backup
          </Button>
        </Panel>
      </Group>

      <Panel>
        <Title order={3} mb="sm">OpenAPI bruto</Title>
        <Text c="dimmed" mb="md">
          O documento atual é auto-gerado por detecção de métodos; serve como apoio técnico, não como contrato final.
        </Text>
        <Code block>{JSON.stringify(openApiQuery.data || {}, null, 2)}</Code>
      </Panel>

      <Panel>
        <Title order={3} mb="sm">Links úteis</Title>
        <Group>
          <Button component="a" href="/docs" target="_blank" rel="noreferrer">
            Abrir Swagger atual
          </Button>
          <Button component="a" href="/api/openapi.json" target="_blank" variant="light" rel="noreferrer">
            Abrir JSON
          </Button>
        </Group>
      </Panel>
    </Stack>
  );
}
