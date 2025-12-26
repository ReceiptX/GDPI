import Link from 'next/link';
import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { Logo } from '@/components/Logo';

const nav = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/arizona-price-index', label: 'Arizona Price Index' },
  { href: '/before-you-pay', label: 'Before you pay' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Logo />

          <nav className="hidden items-center gap-6 md:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-semibold text-slate-200 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild href="/request-demo" variant="secondary" size="sm" className="hidden sm:inline-flex">
              Request a demo
            </Button>
            <Button asChild href="/request-demo" size="sm" className="sm:hidden">
              Demo
            </Button>
          </div>
        </div>
      </Container>
    </header>
  );
}
