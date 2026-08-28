import { useState, type FormEvent } from 'react';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { isValidEmail } from '../../../shared/lib/validation';
import { useLogin } from '../model/useLogin';
import { HttpError } from '../../../shared/api/httpClient';

export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const login = useLogin();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const emailOk = isValidEmail(email);
    setEmailError(emailOk ? '' : '이메일 형식이 올바르지 않습니다.');
    if (!emailOk) return;
    login.mutate({ email, password }, { onSuccess });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input label="이메일" value={email} onChange={(e) => setEmail(e.target.value)} error={emailError} />
      <Input label="비밀번호" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {login.isError && <p className="form-error">{login.error instanceof HttpError ? login.error.message : '로그인에 실패했습니다.'}</p>}
      <Button type="submit" disabled={login.isPending}>
        로그인
      </Button>
    </form>
  );
}
