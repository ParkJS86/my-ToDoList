import { useState, type FormEvent } from 'react';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { isValidEmail } from '../../../shared/lib/validation';
import { useSignup } from '../model/useSignup';
import { HttpError } from '../../../shared/api/httpClient';

export function SignupForm({ onSuccess }: { onSuccess?: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const signup = useSignup();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const emailOk = isValidEmail(email);
    const passwordOk = password.length >= 8;
    setEmailError(emailOk ? '' : '이메일 형식이 올바르지 않습니다.');
    setPasswordError(passwordOk ? '' : '비밀번호는 8자 이상이어야 합니다.');
    if (!emailOk || !passwordOk) return;
    signup.mutate({ email, password, name }, { onSuccess });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input label="이메일" value={email} onChange={(e) => setEmail(e.target.value)} error={emailError} />
      <Input
        label="비밀번호"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={passwordError}
      />
      <Input label="이름" value={name} onChange={(e) => setName(e.target.value)} />
      {signup.isError && <p className="form-error">{signup.error instanceof HttpError ? signup.error.message : '가입에 실패했습니다.'}</p>}
      <Button type="submit" disabled={signup.isPending}>
        가입하기
      </Button>
    </form>
  );
}
