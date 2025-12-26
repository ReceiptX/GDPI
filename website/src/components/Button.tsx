import Link from 'next/link';
import { cn } from '@/components/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-60 disabled:pointer-events-none';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-cyan-400/90 text-slate-950 hover:bg-cyan-300 border border-cyan-300/60 shadow-[0_0_0_1px_rgba(34,211,238,0.12),0_12px_40px_rgba(34,211,238,0.12)]',
  secondary:
    'bg-white/5 text-white hover:bg-white/8 border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]',
  ghost: 'bg-transparent text-slate-200 hover:bg-white/5 border border-transparent',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
};

export function Button({
  asChild,
  href,
  disabled,
  children,
  className,
  variant = 'primary',
  size = 'md',
  target,
  rel,
}: {
  asChild?: boolean;
  href?: string;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  target?: string;
  rel?: string;
}) {
  const cls = cn(base, variants[variant], sizes[size], className);

  if (asChild && href && !disabled) {
    const isInternal = href.startsWith('/');

    if (isInternal) {
      return (
        <Link href={href} className={cls} target={target} rel={rel}>
          {children}
        </Link>
      );
    }

    return (
      <a href={href} className={cls} target={target} rel={rel}>
        {children}
      </a>
    );
  }

  return (
    <button className={cls} type="button" disabled={disabled}>
      {children}
    </button>
  );
}
