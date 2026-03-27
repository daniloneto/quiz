import { AppShell, Burger, Button, Group, NavLink, ScrollArea, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import {
  IconBinaryTree2,
  IconBrain,
  IconDashboard,
  IconDeviceGamepad2,
  IconFingerprint,
  IconLogout,
  IconShieldCheck
} from '@tabler/icons-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import { useSession } from '../state/session';

const adminItems = [
  { to: '/', label: 'Cockpit', icon: IconDashboard },
  { to: '/studio/exams', label: 'Studio', icon: IconBinaryTree2 },
  { to: '/studio/ai', label: 'AI Lab', icon: IconBrain },
  { to: '/studio/console', label: 'Console', icon: IconShieldCheck }
];

const sharedItems = [
  { to: '/playground', label: 'Playground', icon: IconDeviceGamepad2 },
  { to: '/me', label: 'Perfil', icon: IconFingerprint }
];

export function AppFrame() {
  const [opened, { toggle }] = useDisclosure();
  const location = useLocation();
  const { logout, session } = useSession();
  const isAdmin = session?.loginType === 'admin';
  const profileQuery = useQuery({
    queryKey: ['app-frame-profile', session?.uid],
    queryFn: () => api.getProfile(session, session!.uid),
    enabled: Boolean(session?.uid)
  });

  const navItems = isAdmin ? [...adminItems, ...sharedItems] : sharedItems;

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
                Plataforma Quiz
              </Text>
              <Text c="dimmed" size="sm">
                Sua plataforma de estudo gamificada
              </Text>
            </div>
          </Group>

          <Group>
            <Text fw={600}>{profileQuery.data?.nome || 'Carregando usuário'}</Text>
            <Button variant="subtle" color="dark" leftSection={<IconLogout size={16} />} onClick={logout}>
              Sair
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section>
          <Stack gap="xs">
            <Text c="dimmed" size="sm">
              Plataforma de Quiz Game para estudo.
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
                active={
                  item.to === '/'
                    ? location.pathname === '/'
                    : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
                }
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
