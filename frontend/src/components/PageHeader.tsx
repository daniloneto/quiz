import { Badge, Group, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  aside
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  aside?: ReactNode;
}) {
  return (
    <Group justify="space-between" align="flex-end" mb="lg">
      <Stack gap={6}>
        <Badge w="fit-content" variant="light" color="teal">
          {eyebrow}
        </Badge>
        <Title order={1}>{title}</Title>
        <Text c="dimmed">{subtitle}</Text>
      </Stack>
      {aside}
    </Group>
  );
}
