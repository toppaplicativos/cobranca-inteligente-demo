import React from 'react';
import { cn } from '../../lib/cn';
import { labelClass } from '../../lib/formStyles';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormField({ label, htmlFor, required, hint, className, children }: FormFieldProps) {
  return (
    <div className={cn('space-y-0', className)}>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
        {required && <span className="text-[var(--destructive)] ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-[var(--text-muted)]">{hint}</p>}
    </div>
  );
}