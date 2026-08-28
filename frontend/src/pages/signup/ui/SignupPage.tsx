import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../../shared/ui/AuthLayout';
import { SignupForm } from '../../../features/auth/ui/SignupForm';

export function SignupPage() {
  const navigate = useNavigate();
  return (
    <AuthLayout
      title="회원가입"
      footer={<>이미 계정이 있으신가요? <Link to="/login">로그인</Link></>}
    >
      <SignupForm onSuccess={() => navigate('/login')} />
    </AuthLayout>
  );
}
