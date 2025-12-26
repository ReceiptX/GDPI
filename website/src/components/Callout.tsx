import { cn } from '@/components/cn';

type CalloutVariant = 'info' | 'warning' | 'success' | 'danger';

const variantClasses: Record<CalloutVariant, string> = {
  info: 'border-cyan-300/25 bg-cyan-300/10',
  warning: 'border-amber-300/30 bg-amber-300/10',
  success: 'border-emerald-300/25 bg-emerald-300/10',
  danger: 'border-rose-300/25 bg-rose-300/10',
};

export function Callout({
  children,
  className,
  variant = 'info',
}: {
  children: React.ReactNode;
  className?: string;
  variant?: CalloutVariant;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  );
}
