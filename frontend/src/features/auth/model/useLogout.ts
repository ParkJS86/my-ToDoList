import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { logout } from '../api/auth.api';
import { useAuthStore } from '../../../entities/session/model/authStore';

export function useLogout() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      useAuthStore.getState().logout();
      navigate('/login', { replace: true });
    },
  });
}
