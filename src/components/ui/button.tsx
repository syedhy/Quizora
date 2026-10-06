import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'solid' | 'ghost';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  solid:
    'rounded-full bg-[hsl(var(--foreground))] text-[hsl(var(--primary-foreground))] transition-opacity duration-150 hover:opacity-90 active:scale-[0.98]',
  ghost:
    'rounded-full border border-[hsl(var(--border))] bg-transparent text-[hsl(var(--foreground))] transition-colors duration-150 hover:bg-[hsl(var(--muted))] active:scale-[0.98]',
};

export function Button({ className, variant = 'solid', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium outline-none disabled:pointer-events-none disabled:opacity-45',
        variants[variant],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
