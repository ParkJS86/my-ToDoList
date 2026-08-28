import type { ReactNode } from 'react';
import './AuthLayout.css';

interface AuthLayoutProps {
  title: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthLayout({ title, children, footer }: AuthLayoutProps) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="auth-logo">my-ToDoList</p>
        <h2 className="auth-title">{title}</h2>
        {children}
        <p className="auth-footer">{footer}</p>
      </div>
    </div>
  );
}
