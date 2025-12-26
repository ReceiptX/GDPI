import { cn } from '@/components/cn';

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn('max-w-3xl', className)}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 font-heading text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-sm leading-6 text-slate-200 sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
