import { AppShell, Badge, Burger, Button, Group, NavLink, ScrollArea, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconBinaryTree2,
  IconBrain,
  IconDashboard,
  IconDeviceGamepad2,
  IconFingerprint,
  IconLayoutKanban,
  IconLogout,
  IconShieldCheck
} from '@tabler/icons-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '../state/session';

const navItems = [
  { to: '/', label: 'Cockpit', icon: IconDashboard },
  { to: '/studio/exams', label: 'Studio', icon: IconBinaryTree2 },
  { to: '/studio/ai', label: 'AI Lab', icon: IconBrain },
  { to: '/playground', label: 'Playground', icon: IconDeviceGamepad2 },
  { to: '/me', label: 'Perfil', icon: IconFingerprint },
  { to: '/studio/console', label: 'Console', icon: IconShieldCheck }
];

export function AppFrame() {
  const [opened, { toggle }] = useDisclosure();
  const location = useLocation();
  const { logout, session } = useSession();

  return (
    <AppShell
      className="app-shell"
      header={{ height: 72 }}
      navbar={{ width: 290, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header px="md">
        <Group justify="space-between" h="100%">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <div>
              <Text fw={700} fz="xl" ff="Fraunces, serif">
                Quiz Control Room
              </Text>
              <Text c="dimmed" size="sm">
                Studio editorial + playground operacional
              </Text>
            </div>
          </Group>
          <Group>
            <Badge color="teal" variant="light">
              {session?.loginType || 'guest'}
            </Badge>
            <Button variant="subtle" color="dark" leftSection={<IconLogout size={16} />} onClick={logout}>
              Sair
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section>
          <Stack gap="xs">
            <Badge color="orange" variant="dot" size="lg" leftSection={<IconLayoutKanban size={14} />}>
              Two-mode interface
            </Badge>
            <Text c="dimmed" size="sm">
              Um app para operar IA, conteúdo e execução do quiz sem expor a API key ao navegador.
            </Text>
          </Stack>
        </AppShell.Section>

        <AppShell.Section grow component={ScrollArea} mt="lg">
          <Stack gap="xs">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                component={Link}
                to={item.to}
                active={location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)}
                label={item.label}
                leftSection={<item.icon size={18} />}
              />
            ))}
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
