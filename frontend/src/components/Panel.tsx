import { Paper } from '@mantine/core';
import type { PaperProps } from '@mantine/core';
import type { ReactNode } from 'react';

export function Panel({ children, className, ...props }: PaperProps & { children: ReactNode }) {
  return (
    <Paper
      className={className}
      radius="xl"
      p="lg"
      withBorder
      shadow="sm"
      style={{ borderColor: 'rgba(15, 23, 42, 0.08)' }}
      {...props}
    >
      {children}
    </Paper>
  );
}
