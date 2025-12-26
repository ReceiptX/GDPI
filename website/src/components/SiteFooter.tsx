import Link from 'next/link';
import { Container } from '@/components/Container';

const footerLinks = [
  { href: '/security', label: 'Security' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/request-demo', label: 'Request a demo' },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/40">
      <Container>
        <div className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-heading text-sm font-extrabold text-white">GDPI</p>
            <p className="mt-1 text-sm text-slate-300">
              A professional HOA service for fair garage door pricing and calm vendor accountability.
            </p>
            <p className="mt-3 text-xs text-slate-400">© {new Date().getFullYear()} ReceiptX. All rights reserved.</p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {footerLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm font-semibold text-slate-200 hover:text-white">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
