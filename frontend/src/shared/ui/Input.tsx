import type { InputHTMLAttributes } from 'react';
import './Input.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, className, ...rest }: InputProps) {
  return (
    <div className="input-field">
      {label && (
        <label className="input-label" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={['input', error ? 'input-error' : '', className].filter(Boolean).join(' ')}
        {...rest}
      />
      {error && <p className="input-helper-error">{error}</p>}
    </div>
  );
}
