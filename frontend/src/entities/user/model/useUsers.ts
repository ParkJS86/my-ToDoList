import { useQuery } from '@tanstack/react-query';
import { fetchAllUsers } from '../api/user.api';

export function useUsers(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchAllUsers,
    enabled: options?.enabled,
  });
}
