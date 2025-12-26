export type PriceIndexItem = {
  category: string;
  title: string;
  range: string;
  includesLabor: boolean;
  notes: string[];
  whatChangesPrice?: string[];
  homeownerQuestions?: string[];
  redFlags?: string[];
};

// Derived from GDPIFLAGS.txt (Arizona).
export const PRICE_INDEX: PriceIndexItem[] = [
  {
    category: 'Springs',
    title: 'Oil-tempered high-cycle springs (.192–.250) + tune-up',
    range: '$525',
    includesLabor: true,
    notes: ['Non-premium wire sizes (.192–.250).', 'Ask for spring type, wire size, and cycle rating.'],
    homeownerQuestions: [
      'Can you confirm the spring wire size and whether they are oil-tempered or water-tempered?',
      'What is the cycle rating and what warranty is included on parts and labor?',
    ],
  },
  {
    category: 'Springs',
    title: 'Water-tempered springs (often grey)',
    range: '$275–$350',
    includesLabor: true,
    notes: ['Often grey rather than black.'],
    homeownerQuestions: ['Are these springs water-tempered? What warranty is included on parts and labor?'],
  },
  {
    category: 'Rollers',
    title: '10 premium nylon rollers (16×7) + tune-up',
    range: '$175',
    includesLabor: true,
    notes: ['Plastic rollers should be less.', 'Larger doors increase cost.'],
    whatChangesPrice: ['Nylon vs plastic', 'Door size (width/height)', 'Included tune-up scope'],
  },
  {
    category: 'Openers',
    title: 'Belt drive opener replacement (incl. 2 remotes, safety sensors, Wi‑Fi)',
    range: '$475–$600',
    includesLabor: true,
    notes: ['Chain drive is typically cheaper.'],
    whatChangesPrice: [
      'Battery backup, keypad, built-in LED',
      '8ft rail add-on (+$85–$90)',
      'Commercial grade / LiftMaster upgrades',
    ],
  },
  {
    category: 'Openers',
    title: 'Commercial grade opener',
    range: '$850–$1100',
    includesLabor: true,
    notes: ['Heavy duty 3/4 with I-beam rail can be ~$1100.'],
  },
  {
    category: 'Openers',
    title: 'Replace remote / wireless keypad / wall console',
    range: '$175',
    includesLabor: true,
    notes: [],
  },
  {
    category: 'Tune-ups',
    title: 'Tune-up only',
    range: '$60–$75',
    includesLabor: true,
    notes: ['Often bundled with other work.'],
  },
  {
    category: 'Conversions',
    title: 'Torsion conversion (includes springs, 7ft cables, 16ft tube, drums, bearings)',
    range: '$750–$950',
    includesLabor: true,
    notes: ['Price increases for taller/wider doors (more feet).'],
  },
  {
    category: 'Doors',
    title: 'Standard door replacement (16×7 non-insulated steel)',
    range: '$1800–$2450',
    includesLabor: true,
    notes: ['Baseline for standard steel door.'],
    whatChangesPrice: ['More width/height', 'Glass, insulation, vinyl/steel back', 'Premium styles, wood overlay'],
  },
  {
    category: 'Tracks & Hardware',
    title: 'Replace bent track',
    range: '$175 per side',
    includesLabor: true,
    notes: [],
  },
  {
    category: 'Tracks & Hardware',
    title: 'Replace spring pad',
    range: '$150–$250',
    includesLabor: true,
    notes: [],
  },
  {
    category: 'Tracks & Hardware',
    title: 'Cable replacement',
    range: '$175',
    includesLabor: true,
    notes: [],
  },
  {
    category: 'Openers',
    title: 'Opener adjustment',
    range: '$85',
    includesLabor: true,
    notes: [],
  },
  {
    category: 'Openers',
    title: 'Opener gear replacement',
    range: '$175',
    includesLabor: true,
    notes: [],
  },
  {
    category: 'Openers',
    title: 'Opener belt replacement',
    range: '$175',
    includesLabor: true,
    notes: [],
  },
  {
    category: 'Openers',
    title: 'Logic board replacement',
    range: '$260',
    includesLabor: true,
    notes: [],
  },
  {
    category: 'Seals',
    title: 'Bottom seal + retainer (16ft door)',
    range: '$190–$250',
    includesLabor: true,
    notes: ['More feet increases price; less feet decreases price.'],
  },
  {
    category: 'Service',
    title: 'Reset hung door',
    range: '$275',
    includesLabor: true,
    notes: [],
  },
];

export const GLOBAL_RED_FLAGS: string[] = [
  'Vague “lifetime warranty” bundles without itemized parts/labor',
  'Pushing full door replacement without clear damage proof',
  'Extreme labor markups without specs to justify it',
  'Refurbished parts sold as new (ask brand/model and packaging)',
];
