import React from 'react';
import { cn } from '../../lib/cn';

interface MobileFrameProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileFrame({ children, className }: MobileFrameProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full min-w-0 max-w-lg overflow-x-hidden',
        'px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 md:px-4 md:pt-4',
        className
      )}
    >
      {children}
    </div>
  );
}