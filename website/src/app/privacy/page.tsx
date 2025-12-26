import type { Metadata } from 'next';
import { Callout } from '@/components/Callout';
import { Card } from '@/components/Card';
import { Container } from '@/components/Container';
import { SectionHeading } from '@/components/SectionHeading';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'Privacy posture for GDPI: what we collect, why we collect it, and how it is used.',
};

export default function PrivacyPage() {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <SectionHeading
          eyebrow="Respect"
          title="Privacy"
          description="GDPI is designed to help residents understand pricing—not to harvest personal data."
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <Card>
            <p className="text-sm font-semibold text-white">What we collect</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              Quote text (or photo-to-text), job details selected by the user, totals, and the HOA identifier.
            </p>
          </Card>
          <Card>
            <p className="text-sm font-semibold text-white">Why we collect it</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              To generate pricing context, friendly questions to ask vendors, and aggregated community pricing history.
            </p>
          </Card>
          <Card>
            <p className="text-sm font-semibold text-white">What we don’t do</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              We don’t sell quote data or resident data to vendors. We don’t run ads targeting residents based on quote content.
            </p>
          </Card>
          <Card>
            <p className="text-sm font-semibold text-white">Retention & deletion</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              HOAs can request deletion of their community data as part of offboarding.
            </p>
          </Card>
        </div>

        <Callout variant="info" className="mt-8">
          <p className="text-sm font-semibold text-white">Plain-English promise</p>
          <p className="mt-2 text-sm leading-6 text-slate-100">
            GDPI exists to improve transparency in garage door pricing. If we ever add features that change what data is collected,
            we will disclose it clearly.
          </p>
        </Callout>
      </Container>
    </section>
  );
}
