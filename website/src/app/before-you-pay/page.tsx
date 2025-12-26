import type { Metadata } from 'next';
import { Button } from '@/components/Button';
import { Callout } from '@/components/Callout';
import { Card } from '@/components/Card';
import { Container } from '@/components/Container';
import { SectionHeading } from '@/components/SectionHeading';
import { SPRING_BALANCE_CHECK_SCRIPT } from '@/lib/priceIndex';

export const metadata: Metadata = {
  title: 'Before you pay',
  description:
    'A 60-second checklist that prevents the biggest spring scam: wrong springs → unbalanced door → opener damage. Ask to see the door balanced before payment.',
};

export default function BeforeYouPayPage() {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <SectionHeading
          eyebrow="The homeowner protection page"
          title="Before you pay: do these checks"
          description="This is what makes GDPI different: simple proof checks that good technicians can demonstrate in seconds."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <Callout variant="warning">
              <p className="text-sm font-semibold text-white">Signature check</p>
              <p className="mt-2 font-heading text-2xl font-extrabold text-white">
                {SPRING_BALANCE_CHECK_SCRIPT.headline}
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-100">Steps:</p>
              <ol className="mt-2 space-y-2 text-sm leading-6 text-slate-100">
                {SPRING_BALANCE_CHECK_SCRIPT.steps.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span className="mt-[2px] inline-flex h-5 w-5 flex-none items-center justify-center rounded-md bg-white/10 text-xs font-bold text-white">
                      •
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-5 text-sm leading-6 text-slate-100">
                <span className="font-semibold text-white">Why it matters: </span>
                {SPRING_BALANCE_CHECK_SCRIPT.whyItMatters}
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
                “Can you help me understand what’s included in this price (parts, labor, and any fees)?
                Also, before I pay, can you show me the door is balanced?”
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
