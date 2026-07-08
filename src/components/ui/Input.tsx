import React from 'react';
import { cn } from '../../lib/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: 'sm' | 'md';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, inputSize = 'md', ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--bg-surface)]',
        'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
        'transition-[border-color,box-shadow] duration-[var(--duration-fast)]',
        'focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-subtle)]',
        inputSize === 'sm' ? 'h-9 px-3 text-xs' : 'h-10 px-3.5 text-sm min-h-[var(--space-touch)] md:min-h-0',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';