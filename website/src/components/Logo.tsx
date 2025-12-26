import Link from 'next/link';
import { cn } from '@/components/cn';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('group inline-flex items-center gap-2', className)}>
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-300/12 ring-1 ring-cyan-300/25">
        <span className="text-sm font-black tracking-tight text-cyan-200">G</span>
      </span>
      <span className="leading-tight">
        <span className="block font-heading text-sm font-extrabold text-white">GDPI</span>
        <span className="block text-xs font-semibold text-slate-300 group-hover:text-slate-200">
          Garage Door Price Index
        </span>
      </span>
    </Link>
  );
}
