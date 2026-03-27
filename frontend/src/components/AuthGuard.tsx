import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '../state/session';

export function AuthGuard() {
  const { isAuthenticated } = useSession();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
