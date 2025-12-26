import type { Metadata } from 'next';
import { Callout } from '@/components/Callout';
import { Card } from '@/components/Card';
import { Container } from '@/components/Container';
import { SectionHeading } from '@/components/SectionHeading';

export const metadata: Metadata = {
  title: 'Security',
  description: 'Security practices for GDPI: data minimization, secure access, and responsible operations.',
};

export default function SecurityPage() {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <SectionHeading
          eyebrow="Trust"
          title="Security & operations"
          description="HOAs need confidence that a tool is professionally operated. This page communicates how GDPI thinks about security and privacy."
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <Card>
            <p className="text-sm font-semibold text-white">Data minimization</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              We focus on quote text, totals, and high-level job details. We don’t need sensitive personal data to
              provide value.
            </p>
          </Card>
          <Card>
            <p className="text-sm font-semibold text-white">Access control</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              HOA access is managed with secure onboarding and role-based views (admin vs resident).
            </p>
          </Card>
          <Card>
            <p className="text-sm font-semibold text-white">No vendor kickbacks</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              GDPI does not sell leads to vendors. The product is aligned with homeowners and HOAs.
            </p>
          </Card>
          <Card>
            <p className="text-sm font-semibold text-white">Incident readiness</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              We maintain operational logging and a clear process to address issues quickly.
            </p>
          </Card>
        </div>

        <Callout variant="info" className="mt-8">
          <p className="text-sm font-semibold text-white">Want a security review packet?</p>
          <p className="mt-2 text-sm leading-6 text-slate-100">
            We can provide a short security and privacy summary suitable for board review during onboarding.
          </p>
        </Callout>
      </Container>
    </section>
  );
}
