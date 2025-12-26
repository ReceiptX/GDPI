import type { Metadata } from 'next';
import { Button } from '@/components/Button';
import { Callout } from '@/components/Callout';
import { Card } from '@/components/Card';
import { Container } from '@/components/Container';
import { SectionHeading } from '@/components/SectionHeading';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple HOA-friendly pricing: $1.99/home/month locked for 5 years. Includes unlimited resident analyses and community history.',
};

export default function PricingPage() {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <SectionHeading
          eyebrow="One plan"
          title="HOA-friendly pricing that scales"
          description="Keep it simple: a single plan that every HOA can understand. Locked pricing helps boards approve quickly."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <Card className="p-7">
              <div className="flex items-center justify-between gap-6">
                <div>
                  <p className="text-sm font-semibold text-slate-200">GDPI Plan</p>
                  <h2 className="mt-1 font-heading text-3xl font-extrabold text-white">$1.99 / home / month</h2>
                  <p className="mt-2 text-sm text-slate-300">Locked for 5 years • Minimum $99/mo per HOA</p>
                </div>
                <div className="hidden sm:block">
                  <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                    Founding lock
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-white">Includes</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                    <li>• Unlimited resident quote analyses</li>
                    <li>• Quote photo → text (OCR) + paste support</li>
                    <li>• Arizona Price Index (IL ranges + guidance)</li>
                    <li>• Friendly “questions to ask” scripts</li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">HOA admin value</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                    <li>• Community pricing history & trends</li>
                    <li>• Admin roster / secure access</li>
                    <li>• Red-flag education baked into the flow</li>
                    <li>• Future GDPI services included during lock</li>
                  </ul>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild href="/request-demo" size="lg">
                  Request a demo
                </Button>
                <Button asChild href="/how-it-works" variant="secondary" size="lg">
                  How it works
                </Button>
              </div>
            </Card>

            <Callout variant="info" className="mt-6">
              <p className="text-sm font-semibold text-white">How boards justify this in one sentence</p>
              <p className="mt-2 text-sm leading-6 text-slate-100">
                “GDPI helps residents avoid overpriced quotes and unnecessary replacements by requiring itemization and
                clear specs—reducing complaints and repeat issues.”
              </p>
            </Callout>
          </div>

          <div className="lg:col-span-5">
            <Callout variant="warning" className="h-full">
              <p className="text-sm font-semibold text-white">ROI story (simple)</p>
              <p className="mt-2 text-sm leading-6 text-slate-100">
                One prevented upsell or one avoided opener replacement due to incorrect spring balancing can cover the
                annual cost for multiple homes.
              </p>
              <p className="mt-4 text-sm font-semibold text-white">Your signature check:</p>
              <p className="mt-2 font-heading text-xl font-extrabold text-white">Spring-work proof checklist (subscriber-only)</p>
              <div className="mt-5">
                <Button asChild href="/before-you-pay" variant="secondary">
                  Learn more
                </Button>
              </div>
            </Callout>
          </div>
        </div>

        <div className="mt-12">
          <SectionHeading
            eyebrow="Transparency"
            title="No vendor kickbacks. No games."
            description="GDPI doesn’t sell leads to vendors. We’re on the homeowner/HOA side: typical pricing + calm questions + proof checks."
          />
        </div>
      </Container>
    </section>
  );
}
