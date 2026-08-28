import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { LoginPage } from '../pages/login/ui/LoginPage';
import { SignupPage } from '../pages/signup/ui/SignupPage';
import { TodoListPage } from '../pages/todo-list/ui/TodoListPage';
import { TodoCreatePage } from '../pages/todo-create/ui/TodoCreatePage';
import { TodoEditPage } from '../pages/todo-edit/ui/TodoEditPage';
import { ProfilePage } from '../pages/profile/ui/ProfilePage';
import { AdminCategoryPage } from '../pages/admin-category/ui/AdminCategoryPage';
import { AdminUserListPage } from '../pages/admin-user-list/ui/AdminUserListPage';
import { useAuthStore } from '../entities/session/model/authStore';

function IndexRedirect() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  if (isBootstrapping) return null;
  return <Navigate to={accessToken ? '/todos' : '/login'} replace />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IndexRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/todos" element={<TodoListPage />} />
          <Route path="/todos/new" element={<TodoCreatePage />} />
          <Route path="/todos/:todoId/edit" element={<TodoEditPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin/categories" element={<AdminCategoryPage />} />
            <Route path="/admin/users" element={<AdminUserListPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
