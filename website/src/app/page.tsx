import { Button } from '@/components/Button';
import { Callout } from '@/components/Callout';
import { Card } from '@/components/Card';
import { Container } from '@/components/Container';
import { SectionHeading } from '@/components/SectionHeading';

export default function HomePage() {
  return (
    <>
      <section className="pt-14 pb-10 sm:pt-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                Built for HOAs • Arizona pricing baselines • Community history
              </p>
              <h1 className="mt-5 font-heading text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                Garage Door Price Index for HOAs
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-200 sm:text-lg">
                Help residents avoid overpriced garage door quotes—using Arizona baseline pricing, HOA quote history,
                and a simple “before you approve” checklist that keeps conversations calm and professional.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild href="/request-demo" size="lg">
                  Request a demo
                </Button>
                <Button asChild href="/how-it-works" variant="secondary" size="lg">
                  See how it works
                </Button>
              </div>
              <p className="mt-4 text-sm text-slate-300">
                Not affiliated with vendors. We focus on itemization, specs, and clear explanations.
              </p>
            </div>

            <div className="lg:col-span-5">
              <Card className="p-6">
                <p className="text-sm font-semibold text-slate-200">One plan, HOA-friendly pricing</p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="font-heading text-4xl font-extrabold text-white">$1.99</span>
                  <span className="pb-1 text-sm text-slate-300">/home/mo • locked for 5 years</span>
                </div>
                <p className="mt-2 text-sm text-slate-300">Minimum $99/mo per HOA.</p>
                <ul className="mt-5 space-y-3 text-sm text-slate-200">
                  <li>• Unlimited quote analyses for residents</li>
                  <li>• Arizona Price Index (IL ranges + what changes price)</li>
                  <li>• Community pricing history for your HOA</li>
                  <li>• Admin roster + secure access</li>
                </ul>
                <div className="mt-6">
                  <Button asChild href="/request-demo" className="w-full">
                    Request a demo
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container>
          <SectionHeading
            eyebrow="Exceptional service"
            title="What your HOA gets"
            description="Everything is designed to reduce resident frustration, prevent unnecessary upsells, and make vendors explain above-average pricing clearly."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Card>
              <h3 className="font-heading text-lg font-bold text-white">Instant sanity checks</h3>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Paste a quote (or upload a photo) and get a clear, calm summary: fair price vs. needs explanation,
                plus friendly questions to ask.
              </p>
            </Card>
            <Card>
              <h3 className="font-heading text-lg font-bold text-white">Arizona Price Index</h3>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                IL ranges (includes labor) and what drives pricing up or down—materials, door size, add-ons,
                and after-hours multipliers.
              </p>
            </Card>
            <Card>
              <h3 className="font-heading text-lg font-bold text-white">HOA pricing history</h3>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Residents see what neighbors actually paid for similar work. That alone prevents “panic approvals.”
              </p>
            </Card>
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container>
          <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7">
              <SectionHeading
                eyebrow="The signature differentiator"
                title="Before you pay for spring work, ask one question"
                description="This single check prevents the most expensive chain reaction: wrong springs → unbalanced door → opener damage."
              />
              <Callout variant="warning" className="mt-6">
                <p className="text-sm font-semibold text-white">Ask this before payment:</p>
                <p className="mt-2 font-heading text-xl font-extrabold text-white">
                  Spring-work proof checklist (subscriber-only)
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-100">
                  GDPI includes a short proof checklist residents can use before paying for spring work. We keep the
                  step-by-step details inside the subscriber experience.
                </p>
                <div className="mt-5">
                  <Button asChild href="/before-you-pay" variant="secondary">
                    Learn what you’ll unlock
                  </Button>
                </div>
              </Callout>
            </div>
            <div className="lg:col-span-5">
              <Callout variant="info" className="h-full">
                <p className="text-sm font-semibold text-white">Quick red‑flag check (before you upload)</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-100">
                  <li>• Vague “lifetime warranty” bundles with no itemization</li>
                  <li>• Pushing full door replacement without clear damage proof</li>
                  <li>• Extreme labor markups with no specs to justify them</li>
                  <li>• Refurbished parts sold as new (ask brand/model)</li>
                </ul>
                <div className="mt-5">
                  <Button asChild href="/arizona-price-index" size="sm" variant="ghost">
                    Browse Arizona baselines
                  </Button>
                </div>
              </Callout>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container>
          <SectionHeading
            eyebrow="Arizona baselines (IL)"
            title="A few common ranges (includes labor)"
            description="Use these as anchors—then ask what drives anything above average (materials/specs, door size, add-ons, after-hours)."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <p className="text-sm font-semibold text-white">Tune-up only</p>
              <p className="mt-2 font-heading text-2xl font-extrabold text-white">$60–$75</p>
              <p className="mt-2 text-sm text-slate-200">Often bundled with other work.</p>
            </Card>
            <Card>
              <p className="text-sm font-semibold text-white">Water‑tempered springs</p>
              <p className="mt-2 font-heading text-2xl font-extrabold text-white">$275–$350</p>
              <p className="mt-2 text-sm text-slate-200">Usually grey; lower-cost option.</p>
            </Card>
            <Card>
              <p className="text-sm font-semibold text-white">Oil‑tempered high-cycle springs + tune‑up</p>
              <p className="mt-2 font-heading text-2xl font-extrabold text-white">~$525</p>
              <p className="mt-2 text-sm text-slate-200">Non-premium wire (.192–.250).</p>
            </Card>
            <Card>
              <p className="text-sm font-semibold text-white">Torsion conversion</p>
              <p className="mt-2 font-heading text-2xl font-extrabold text-white">$750–$950</p>
              <p className="mt-2 text-sm text-slate-200">More $ for taller/wider doors.</p>
            </Card>
            <Card>
              <p className="text-sm font-semibold text-white">Standard 16×7 door replacement</p>
              <p className="mt-2 font-heading text-2xl font-extrabold text-white">$1800–$2450</p>
              <p className="mt-2 text-sm text-slate-200">Non-insulated steel door (baseline).</p>
            </Card>
            <Card>
              <p className="text-sm font-semibold text-white">Bent track</p>
              <p className="mt-2 font-heading text-2xl font-extrabold text-white">$175/side</p>
              <p className="mt-2 text-sm text-slate-200">Per side, includes labor.</p>
            </Card>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild href="/arizona-price-index" variant="secondary">
              Browse the full Price Index
            </Button>
            <Button asChild href="/pricing" variant="ghost">
              See pricing
            </Button>
          </div>
        </Container>
      </section>

      <section className="py-14">
        <Container>
          <Card className="p-8">
            <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-8">
                <h2 className="font-heading text-2xl font-extrabold text-white">Ready to protect your community?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  We’ll walk you through the resident experience, admin controls, and how pricing history improves over time.
                </p>
              </div>
              <div className="lg:col-span-4">
                <Button asChild href="/request-demo" size="lg" className="w-full">
                  Request a demo
                </Button>
              </div>
            </div>
          </Card>
        </Container>
      </section>
    </>
  );
}
