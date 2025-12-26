import type { Metadata } from 'next';
import { LeadForm } from '@/components/LeadForm';
import { Callout } from '@/components/Callout';
import { Card } from '@/components/Card';
import { Container } from '@/components/Container';
import { SectionHeading } from '@/components/SectionHeading';

export const metadata: Metadata = {
  title: 'Request a demo',
  description: 'Request a GDPI demo for your HOA or property management portfolio.',
};

export default function RequestDemoPage() {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <SectionHeading
          eyebrow="Board-ready"
          title="Request a demo"
          description="We’ll show the resident experience, how the Price Index works, and how HOA pricing history becomes more accurate over time."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <Card className="p-7">
              <LeadForm />
            </Card>

            <Callout variant="info" className="mt-6">
              <p className="text-sm font-semibold text-white">What you’ll get in the demo</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-100">
                <li>• Quote photo/paste + job details workflow</li>
                <li>• Calm, friendly “questions to ask” output</li>
                <li>• Arizona baselines and what drives price changes</li>
                <li>• HOA history view and admin controls</li>
              </ul>
            </Callout>
          </div>

          <div className="lg:col-span-5">
            <Callout variant="warning" className="h-full">
              <p className="text-sm font-semibold text-white">For spring tickets, this saves the most money</p>
              <p className="mt-2 text-sm leading-6 text-slate-100">
                Ask the tech to demonstrate the door is balanced before payment. If they can’t, the opener will suffer.
              </p>
              <p className="mt-4 text-sm font-semibold text-white">Script:</p>
              <p className="mt-2 font-heading text-xl font-extrabold text-white">“Can you show me my door is balanced?”</p>
            </Callout>
          </div>
        </div>
      </Container>
    </section>
  );
}
