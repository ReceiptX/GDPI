import type { Metadata } from 'next';
import { Button } from '@/components/Button';
import { Callout } from '@/components/Callout';
import { Card } from '@/components/Card';
import { Container } from '@/components/Container';
import { SectionHeading } from '@/components/SectionHeading';

export const metadata: Metadata = {
  title: 'How it works',
  description:
    'See how GDPI helps HOAs and residents evaluate garage door quotes using Arizona baseline pricing, community history, and calm vendor questions.',
};

export default function HowItWorksPage() {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <SectionHeading
          eyebrow="End-to-end"
          title="A simple workflow residents actually use"
          description="GDPI is built around one idea: set a baseline, then ask for clear specs and itemization when pricing is above typical."
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Step 1</p>
            <h3 className="mt-3 font-heading text-lg font-extrabold text-white">Upload or paste the quote</h3>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              Residents can paste text or snap a photo. Before analysis, GDPI shows a quick red‑flag checklist so
              homeowners know what to look for.
            </p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Step 2</p>
            <h3 className="mt-3 font-heading text-lg font-extrabold text-white">Confirm the job details</h3>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              Door type + optional details, plus a parts/services checklist and total cost. The goal is to analyze the
              whole ticket, not cherry-picked line items.
            </p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Step 3</p>
            <h3 className="mt-3 font-heading text-lg font-extrabold text-white">Get calm, actionable output</h3>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              A verdict (fair vs. needs explanation), price context, and friendly questions that request specifics:
              parts, labor, fees, materials/specs, and warranty.
            </p>
          </Card>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <Callout variant="info">
              <p className="text-sm font-semibold text-white">Why HOAs adopt GDPI</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-100">
                <li>• Fewer resident complaints and “vendor drama”</li>
                <li>• Clear expectations: itemized quotes, real specs, real warranties</li>
                <li>• Community pricing history becomes more accurate over time</li>
                <li>• Helps good technicians explain premium work—and exposes bad ones who won’t</li>
              </ul>
            </Callout>
          </div>
          <div className="lg:col-span-5">
            <Callout variant="warning">
              <p className="text-sm font-semibold text-white">The single most important check</p>
              <p className="mt-2 font-heading text-xl font-extrabold text-white">
                “Can you show me my door is balanced?”
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-100">
                If springs are being replaced, this is the proof the job was finished correctly.
              </p>
              <div className="mt-5">
                <Button asChild href="/before-you-pay" variant="secondary">
                  See the balance test
                </Button>
              </div>
            </Callout>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild href="/request-demo" size="lg">
            Request a demo
          </Button>
          <Button asChild href="/arizona-price-index" variant="secondary" size="lg">
            Browse the Price Index
          </Button>
        </div>
      </Container>
    </section>
  );
}
