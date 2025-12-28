import type { JobTiming, QuoteVerdict } from '../types';

export type TorsionPricingSignal = {
  /** Whether the heuristic applied at all */
  applied: boolean;
  /** How severe the heuristic thinks the quote is */
  verdict?: QuoteVerdict;
  /** A short explanation suitable for red flags */
  redFlag?: string;
  /** A calm question to ask the vendor */
  vendorQuestion?: string;
  /** Notes about exceptions / why severity was reduced */
  notes?: string[];
};

type DoorContext = {
  doorSetup?: string;
  timing: JobTiming;
};

const SPRING_KEYWORDS = [
  'spring',
  'springs',
  'torsion spring',
  'torsion springs',
  'spring set',
  'spring pair',
];

const OIL_TEMPERED_KEYWORDS = ['oil tempered', 'oil-tempered', 'ot spring', 'ot springs', 'oil tempered springs'];

const TORSION_OTHER_PART_KEYWORDS = [
  // cables
  'cable',
  'cables',
  'lift cable',
  'lift cables',
  // bearings / plates
  'bearing',
  'bearings',
  'end bearing',
  'end bearings',
  'center bearing',
  'bearing plate',
  'bearing plates',
  'end plate',
  'end plates',
  'center plate',
  'center bracket',
  // hardware
  'drum',
  'drums',
  'torsion tube',
  'torsion shaft',
  'shaft',
  'tube',
  'spring anchor',
  'anchor bracket',
];

const MULTI_DOOR_KEYWORDS = ['two doors', '2 doors', 'both doors', 'double doors', 'pair of doors'];

const OVERSIZE_OR_SPECIAL_KEYWORDS = [
  'high lift',
  'high-lift',
  'vertical lift',
  'rv',
  'commercial',
  'custom',
  'carriage',
  'wood',
  'oversize',
  'over-sized',
  'heavy',
  '18x',
  '20x',
  '8ft',
  '10ft',
];

function includesAny(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts a likely total amount from free-form quote text.
 * - Prefers $ amounts
 * - Falls back to lines containing "total"
 */
export function extractLikelyTotalAmount(text: string): number {
  const t = text;

  const dollarMatches = Array.from(t.matchAll(/\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/g))
    .map((m) => parseFloat(m[1].replace(/,/g, '')))
    .filter((n) => Number.isFinite(n));

  if (dollarMatches.length > 0) {
    // totals are often the largest dollar figure present
    return Math.max(...dollarMatches);
  }

  const lines = t.split(/\r?\n/).map((l) => l.trim());
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (!lower.includes('total')) continue;

    const m = line.match(/(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/);
    if (!m) continue;

    const n = parseFloat(m[1].replace(/,/g, ''));
    if (Number.isFinite(n)) return n;
  }

  return 0;
}

/**
 * Torsion pricing heuristic (standard 16x7) based on your field benchmarks:
 * - Springs-only (oil-tempered): red flag if > $675
 * - Springs + any other torsion part: red flag if > $700
 *
 * Exceptions reduce severity to yellow:
 * - after-hours/emergency
 * - multiple doors bundled
 * - oversized/special door / high-lift
 */
export function evaluateTorsionSpringPricing(
  quoteText: string,
  amount: number,
  ctx: DoorContext
): TorsionPricingSignal {
  const t = normalize(quoteText);

  if (!amount || amount <= 0) return { applied: false };

  const hasSprings = includesAny(t, SPRING_KEYWORDS);
  if (!hasSprings) return { applied: false };

  // Only apply to the user's "standard 16x7" default. We approximate this as "double door" + "7ft".
  // If we can't confidently determine it, we still apply but will soften more aggressively when in doubt.
  const setup = normalize(ctx.doorSetup ?? '');
  const seemsStandard16x7 = setup.includes('double') && setup.includes('7ft');

  const hasOtherTorsionParts = includesAny(t, TORSION_OTHER_PART_KEYWORDS);
  const oilTemperedExplicit = includesAny(t, OIL_TEMPERED_KEYWORDS);

  // If the quote text contains "spring" and also "center bearing" (or similar), we treat it as "springs + torsion part".
  const springsPlusTorsionParts = hasOtherTorsionParts;

  let verdict: QuoteVerdict | undefined;
  let redFlag: string | undefined;
  let vendorQuestion: string | undefined;

  if (!springsPlusTorsionParts) {
    // Springs-only rule is explicitly for oil-tempered.
    if (!oilTemperedExplicit) {
      // We won't hard-red a quote if we can't tell spring type.
      return { applied: false };
    }

    if (amount > 675) {
      verdict = 'red';
      redFlag = `Oil-tempered springs-only on a standard 16×7 door is a red flag when over $675 (quoted $${Math.round(
        amount
      )}).`;
      vendorQuestion =
        'Can you help me understand what is included beyond springs (service call, tune-up, bearings/cables, disposal/fees) and why the price is above a typical springs-only benchmark?';
    }
  } else {
    if (amount > 700) {
      verdict = 'red';
      redFlag = `Springs plus any other torsion-system part on a standard 16×7 door is a red flag when over $700 (quoted $${Math.round(
        amount
      )}).`;
      vendorQuestion =
        'Would you mind walking me through an itemized breakdown (springs, parts like cables/bearings, labor, service call, and any fees) and confirming exactly which torsion-system parts are being replaced?';
    }

    // Extra note about center bearing add-on.
    if (verdict && t.includes('center bearing')) {
      vendorQuestion =
        'Can you help me understand why the center bearing is charged separately? Many companies include the center bearing with a spring job unless it is damaged.';
    }
  }

  if (!verdict) return { applied: false };

  // Exception handling: downgrade to yellow if after-hours / multi-door / oversize / not clearly standard.
  const notes: string[] = [];
  const hasMultiDoorSignal = includesAny(t, MULTI_DOOR_KEYWORDS);
  const hasOversizeSignal = includesAny(t, OVERSIZE_OR_SPECIAL_KEYWORDS);

  if (ctx.timing === 'after-hours') {
    notes.push('After-hours/emergency timing can legitimately increase pricing.');
  }
  if (hasMultiDoorSignal) {
    notes.push('Quote may cover multiple doors.');
  }
  if (hasOversizeSignal) {
    notes.push('Door may be oversized/special (e.g., high-lift/custom/heavy), which can increase parts and labor.');
  }
  if (!seemsStandard16x7) {
    notes.push('Door setup may not match a standard 16×7 benchmark.');
  }

  const shouldDowngrade = ctx.timing === 'after-hours' || hasMultiDoorSignal || hasOversizeSignal || !seemsStandard16x7;

  return {
    applied: true,
    verdict: shouldDowngrade ? 'yellow' : verdict,
    redFlag,
    vendorQuestion,
    notes: notes.length ? notes : undefined,
  };
}
