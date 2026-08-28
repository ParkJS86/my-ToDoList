import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../entities/session/model/authStore';
import { NavBar } from '../widgets/nav-bar/ui/NavBar';

export function ProtectedRoute() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  if (isBootstrapping) {
    return null;
  }
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
}
