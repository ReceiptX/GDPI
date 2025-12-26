'use client';

import { useId, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { cn } from '@/components/cn';

function encodeMailto(value: string) {
  return encodeURIComponent(value);
}

const ROLE_OPTIONS = ['HOA Board', 'Property Manager', 'Resident', 'Other'] as const;
type Role = (typeof ROLE_OPTIONS)[number];

export function LeadForm() {
  const id = useId();
  const [hoaName, setHoaName] = useState('');
  const [role, setRole] = useState<Role>('HOA Board');
  const [homes, setHomes] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const { href, disabledReason } = useMemo(() => {
    if (!hoaName.trim()) return { href: '', disabledReason: 'Enter HOA name' };
    if (!email.trim()) return { href: '', disabledReason: 'Enter your email' };

    const subject = `GDPI demo request — ${hoaName.trim()}`;
    const bodyLines = [
      `HOA: ${hoaName.trim()}`,
      `Role: ${role}`,
      `Homes (approx): ${homes.trim() || 'Unknown'}`,
      `Email: ${email.trim()}`,
      '',
      'Notes:',
      notes.trim() || '(none)',
    ];

    const body = bodyLines.join('\n');

    // Change this to your real inbox when ready.
    const to = 'support@gdpi.app';

    return {
      href: `mailto:${to}?subject=${encodeMailto(subject)}&body=${encodeMailto(body)}`,
      disabledReason: '',
    };
  }, [email, hoaName, homes, notes, role]);

  const isReady = !!href;

  return (
    <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
      <div className="grid gap-2">
        <label htmlFor={`${id}-hoaName`} className="text-sm font-semibold text-slate-200">
          HOA name
        </label>
        <input
          id={`${id}-hoaName`}
          value={hoaName}
          onChange={(e) => setHoaName(e.target.value)}
          className={cn(
            'h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-cyan-300/60'
          )}
          placeholder="e.g., Desert Ridge HOA"
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor={`${id}-role`} className="text-sm font-semibold text-slate-200">
            Your role
          </label>
          <select
            id={`${id}-role`}
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className={cn(
              'h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white',
              'focus:outline-none focus:ring-2 focus:ring-cyan-300/60'
            )}
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <label htmlFor={`${id}-homes`} className="text-sm font-semibold text-slate-200">
            Homes (approx)
          </label>
          <input
            id={`${id}-homes`}
            value={homes}
            onChange={(e) => setHomes(e.target.value)}
            className={cn(
              'h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-400',
              'focus:outline-none focus:ring-2 focus:ring-cyan-300/60'
            )}
            placeholder="e.g., 220"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor={`${id}-email`} className="text-sm font-semibold text-slate-200">
          Email
        </label>
        <input
          id={`${id}-email`}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={cn(
            'h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-cyan-300/60'
          )}
          placeholder="you@company.com"
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor={`${id}-notes`} className="text-sm font-semibold text-slate-200">
          Notes (optional)
        </label>
        <textarea
          id={`${id}-notes`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={cn(
            'min-h-[110px] rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-cyan-300/60'
          )}
          placeholder="Anything you want us to know (vendor issues, resident complaints, etc.)"
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-400">
          This opens your email client with a prefilled message (no tracking, no spam).
        </p>
        <Button
          asChild={isReady}
          href={isReady ? href : undefined}
          size="lg"
          className="w-full sm:w-auto"
          variant="primary"
          disabled={!isReady}
        >
          {disabledReason ? `Complete form: ${disabledReason}` : 'Send demo request'}
        </Button>
      </div>
    </form>
  );
}
