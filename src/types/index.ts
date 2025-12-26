// Core data types for GDPI application

export type UserRole = 'homeowner' | 'admin';

export type QuoteVerdict = 'green' | 'yellow' | 'red';

export type JobTiming = 'scheduled' | 'after-hours';

export type BillingInterval = 'monthly' | 'annual';

export interface User {
  email: string;
  pin: string;
  hoaId: string;
  role: UserRole;
}

export interface Resident {
  email: string;
  pin: string;
  hoaId: string;
  role: UserRole; // Explicit role field for production security
  createdAt?: string;
}

export interface Quote {
  id: string;
  hoaId: string;
  submittedAt: string; // ISO date string
  jobType: string; // e.g., "Torsion springs (pair)"
  timing: JobTiming;
  doorSetup: string; // e.g., "Double, insulated, 7ft"
  quotedAmount: number;
  verdict: QuoteVerdict;
  notes: string;
}

export interface AppData {
  hoaId: string;
  residents: Resident[];
  quoteHistory: Quote[];
  subscriptions: SubscriptionRecord[];
}

export interface SubscriptionPlan {
  id: string;
  label: string;
  price: number;
  currency: string;
  billingInterval: BillingInterval;
  lockDurationYears: number;
  includesFutureServices: boolean;
  description: string;
  perks: string[];
}

export interface SubscriptionRecord {
  hoaId: string;
  planId: string;
  lockedPrice: number;
  currency: string;
  billingInterval: BillingInterval;
  lockStart: string;
  lockExpires: string;
  includesFutureServices: boolean;
}

export interface AIAnalysisResult {
  verdict: QuoteVerdict;
  priceContext: string;
  redFlags: string[];
  vendorQuestions: string[];
  nextStep: string;
}

export interface ManualQuoteEntry {
  parts: {
    torsionSprings?: boolean;
    rollers?: boolean;
    hinges?: boolean;
    cables?: boolean;
    opener?: boolean;
    panels?: boolean;
    fullDoor?: boolean;
    other?: string;
  };
  laborCost: string;
  timing: JobTiming;
  doorSetup: string;
  notes: string;
}

export interface BaselinePricing {
  serviceCall: [number, number];
  torsionSprings: [number, number];
  /** Springs-only benchmark (wire size up to 0.250). Scheduled service should generally not exceed this. */
  torsionSpringsMaxUpToWire250: number;
  rollers: [number, number];
  opener: [number, number];
  panelSwap: [number, number];
  singleDoor: [number, number];
  doubleDoor: [number, number];
  torsionConversion: [number, number];
  afterHoursMultiplier: [number, number];
}

export interface HOARegistration {
  hoaId: string;
  hoaName: string;
  adminEmail: string;
  adminName: string;
}
