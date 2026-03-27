import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '../types';

type SessionContextValue = {
  session: Session | null;
  isAuthenticated: boolean;
  setSession: (session: Session | null) => void;
  logout: () => void;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);
const STORAGE_KEY = 'quiz-control-room-session';

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Session;
      setSessionState(parsed);
    } catch (error) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const setSession = (nextSession: Session | null) => {
    setSessionState(nextSession);
    if (nextSession) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const logout = () => setSession(null);

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session?.token),
      setSession,
      logout
    }),
    [session]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return value;
}
