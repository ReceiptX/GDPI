import type { Metadata } from 'next';
import { Button } from '@/components/Button';
import { Callout } from '@/components/Callout';
import { Card } from '@/components/Card';
import { Container } from '@/components/Container';
import { SectionHeading } from '@/components/SectionHeading';

export const metadata: Metadata = {
  title: 'Before you pay',
  description:
    'Subscriber-only proof checks that prevent expensive spring mistakes. Learn what to request before paying for spring work.',
};

export default function BeforeYouPayPage() {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <SectionHeading
          eyebrow="The homeowner protection page"
          title="Before you pay: subscriber-only proof checks"
          description="We keep the step-by-step proof checks inside GDPI for subscribers. This page explains what you’ll unlock and why it matters."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <Callout variant="warning">
              <p className="text-sm font-semibold text-white">Subscriber-only unlock</p>
              <p className="mt-2 font-heading text-2xl font-extrabold text-white">
                The spring-work proof checklist (Balance Test)
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-100">
                Springs are where the highest-cost mistakes happen. GDPI includes a quick proof checklist that helps
                residents avoid the chain reaction of recurring service calls and premature opener wear.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button asChild href="/request-demo" size="lg">
                  Request a demo
                </Button>
                <Button asChild href="/pricing" variant="secondary" size="lg">
                  See pricing
                </Button>
              </div>
              <p className="mt-4 text-xs text-slate-300">
                Note: we intentionally keep the step-by-step checklist inside the subscriber experience.
              </p>
            </Callout>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Card>
                <p className="text-sm font-semibold text-white">Always request itemization</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Ask for an itemized breakdown: parts, labor, service call, after-hours fee, disposal, taxes.
                  Vague bundles make it impossible to compare.
                </p>
              </Card>
              <Card>
                <p className="text-sm font-semibold text-white">Confirm parts are new</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  If the price is unusually low (or there’s a huge cash discount), ask whether parts are new or used.
                  Request brand/model.
                </p>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-5">
            <Callout variant="info" className="h-full">
              <p className="text-sm font-semibold text-white">A calm script (copy/paste)</p>
              <p className="mt-3 text-sm leading-6 text-slate-100">
                “Can you help me understand what’s included in this price (parts, labor, and any fees)?”
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-100">
                Good techs can demonstrate. Bad techs usually avoid specifics.
              </p>
              <div className="mt-6 space-y-3">
                <Button asChild href="/request-demo" className="w-full" size="lg">
                  Request a demo
                </Button>
                <Button asChild href="/arizona-price-index" variant="secondary" className="w-full" size="lg">
                  Browse Arizona baselines
                </Button>
              </div>
            </Callout>
          </div>
        </div>
      </Container>
    </section>
  );
}
