import type { Metadata } from 'next';
import { Button } from '@/components/Button';
import { Callout } from '@/components/Callout';
import { Card } from '@/components/Card';
import { Container } from '@/components/Container';
import { SectionHeading } from '@/components/SectionHeading';
import { GLOBAL_RED_FLAGS, PRICE_INDEX } from '@/lib/priceIndex';

export const metadata: Metadata = {
  title: 'Arizona Price Index',
  description:
    'Arizona garage door pricing baselines (includes labor) with practical guidance: what changes price, questions to ask, and red flags.',
};

function groupByCategory() {
  const map = new Map<string, typeof PRICE_INDEX>();
  for (const item of PRICE_INDEX) {
    const arr = map.get(item.category) || [];
    arr.push(item);
    map.set(item.category, arr);
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

export default function ArizonaPriceIndexPage() {
  const groups = groupByCategory();

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <SectionHeading
          eyebrow="Arizona baselines"
          title="Arizona Price Index (IL = includes labor)"
          description="Use these ranges as anchors. Higher pricing can be fine when premium parts/specs justify it—your goal is to get clear itemization and specifics."
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {groups.map(([category, items]) => (
              <div key={category} className="mt-8 first:mt-0">
                <h2 className="font-heading text-xl font-extrabold text-white">{category}</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {items.map((it) => (
                    <Card key={`${it.category}:${it.title}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-white">{it.title}</p>
                          <p className="mt-2 font-heading text-2xl font-extrabold text-white">{it.range}</p>
                          <p className="mt-1 text-xs text-slate-300">{it.includesLabor ? 'IL (includes labor)' : 'Labor not included'}</p>
                        </div>
                      </div>

                      {it.notes.length ? (
                        <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-200">
                          {it.notes.map((n) => (
                            <li key={n}>• {n}</li>
                          ))}
                        </ul>
                      ) : null}

                      {it.whatChangesPrice?.length ? (
                        <div className="mt-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">What changes price</p>
                          <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-200">
                            {it.whatChangesPrice.map((n) => (
                              <li key={n}>• {n}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {it.homeownerQuestions?.length ? (
                        <div className="mt-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Questions to ask</p>
                          <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-200">
                            {it.homeownerQuestions.map((q) => (
                              <li key={q}>• {q}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {it.redFlags?.length ? (
                        <div className="mt-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">Red flags</p>
                          <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-100">
                            {it.redFlags.map((rf) => (
                              <li key={rf}>• {rf}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <Callout variant="warning">
                <p className="text-sm font-semibold text-white">Quick red‑flag checklist</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-100">
                  {GLOBAL_RED_FLAGS.map((rf) => (
                    <li key={rf}>• {rf}</li>
                  ))}
                </ul>
                <div className="mt-5">
                  <Button asChild variant="secondary" href="/before-you-pay">
                    Balance test (springs)
                  </Button>
                </div>
              </Callout>

              <Callout variant="info" className="mt-4">
                <p className="text-sm font-semibold text-white">A note about premium pricing</p>
                <p className="mt-2 text-sm leading-6 text-slate-100">
                  Above-baseline pricing isn’t automatically bad. Premium parts can justify more—oil-tempered vs
                  water-tempered springs, wire sizes above 0.250, higher-cycle sets, upgraded bearings/plates, and
                  nylon rollers.
                </p>
              </Callout>

              <div className="mt-4">
                <Button asChild href="/request-demo" className="w-full" size="lg">
                  Request a demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
