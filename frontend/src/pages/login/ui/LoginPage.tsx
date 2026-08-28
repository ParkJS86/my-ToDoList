import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../../shared/ui/AuthLayout';
import { LoginForm } from '../../../features/auth/ui/LoginForm';

export function LoginPage() {
  const navigate = useNavigate();
  return (
    <AuthLayout
      title="로그인"
      footer={<>계정이 없으신가요? <Link to="/signup">회원가입</Link></>}
    >
      <LoginForm onSuccess={() => navigate('/todos')} />
    </AuthLayout>
  );
}
