import type { TextareaHTMLAttributes } from 'react';
import './Input.css';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, id, className, ...rest }: TextareaProps) {
  return (
    <div className="input-field">
      {label && (
        <label className="input-label" htmlFor={id}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={['input', 'textarea', error ? 'input-error' : '', className].filter(Boolean).join(' ')}
        {...rest}
      />
      {error && <p className="input-helper-error">{error}</p>}
    </div>
  );
}
