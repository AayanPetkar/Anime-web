'use client';

import { forwardRef } from 'react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  { label, error, id, className = '', ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        className={`rounded-xl border bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-neon-blue/50 ${
          error ? 'border-neon-red/60' : 'border-white/15'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-neon-red">{error}</span>}
    </div>
  );
});
