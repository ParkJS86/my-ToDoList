import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../entities/session/model/authStore';

export function AdminRoute() {
  const currentUser = useAuthStore((state) => state.currentUser);
  if (currentUser?.role !== 'Admin') {
    return <Navigate to="/todos" replace />;
  }
  return <Outlet />;
}
