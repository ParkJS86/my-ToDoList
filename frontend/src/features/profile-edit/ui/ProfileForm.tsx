import { useState, type FormEvent } from 'react';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { useAuthStore } from '../../../entities/session/model/authStore';
import { useUpdateCurrentUser } from '../../../entities/user/model/useUpdateCurrentUser';
import { HttpError } from '../../../shared/api/httpClient';

export function ProfileForm() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const updateCurrentUserInfo = useAuthStore((state) => state.updateCurrentUserInfo);
  const [name, setName] = useState(currentUser?.name ?? '');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const updateCurrentUser = useUpdateCurrentUser();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSuccessMessage('');
    const payload = { name, ...(password ? { password } : {}) };
    updateCurrentUser.mutate(payload, {
      onSuccess: (user) => {
        updateCurrentUserInfo({ name: user.name });
        setPassword('');
        setSuccessMessage('저장되었습니다.');
      },
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input label="이메일" value={currentUser?.email ?? ''} disabled />
      <Input label="이름" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input
        label="비밀번호"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="변경 시에만 입력"
      />
      {successMessage && <p>{successMessage}</p>}
      {updateCurrentUser.isError && (
        <p style={{ color: 'var(--color-danger)', fontSize: 'var(--fs-sm)' }}>
          {updateCurrentUser.error instanceof HttpError ? updateCurrentUser.error.message : '저장에 실패했습니다.'}
        </p>
      )}
      <Button type="submit" disabled={updateCurrentUser.isPending}>저장</Button>
    </form>
  );
}
