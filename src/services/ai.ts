import { AIAnalysisResult, QuoteVerdict, JobTiming, BaselinePricing } from '../types';
import { evaluateTorsionSpringPricing, extractLikelyTotalAmount } from '../utils/torsionHeuristics';

// Arizona baseline pricing reference
const ARIZONA_BASELINE: BaselinePricing = {
  serviceCall: [75, 150],
  torsionSprings: [320, 520],
  torsionSpringsMaxUpToWire250: 600,
  rollers: [180, 320],
  opener: [650, 900],
  panelSwap: [950, 1350],
  singleDoor: [1600, 2200],
  doubleDoor: [2400, 3600],
  torsionConversion: [420, 650],
  afterHoursMultiplier: [1.4, 2.0],
};

export class AIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeQuote(
    quoteText: string,
    timing: JobTiming,
    doorSetup: string
  ): Promise<AIAnalysisResult> {
    if (!this.apiKey || this.apiKey === 'your_groq_api_key_here') {
      // Return mock analysis if no API key
      return this.getMockAnalysis(quoteText, timing, doorSetup);
    }

    try {
      const prompt = this.buildAnalysisPrompt(quoteText, timing, doorSetup);
      
      // Using Groq API with Llama 3.1 70B model
      // Free tier: 14,400 requests/day with ultra-fast inference
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are the GDPI Assistant, an expert in Arizona garage door pricing analysis. Provide concise, accurate assessments based on Arizona baseline pricing.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';

      const parsed = this.parseAIResponse(content, timing);
      return this.applyHeuristics(parsed, quoteText, timing, doorSetup);
    } catch (error) {
      console.error('Error analyzing quote with AI:', error);
      // Fallback to mock analysis
      return this.getMockAnalysis(quoteText, timing, doorSetup);
    }
  }

  private buildAnalysisPrompt(quoteText: string, timing: JobTiming, doorSetup: string): string {
    const baselinePricing = this.formatBaselinePricing();
    
    return `Analyze this Arizona garage door service quote:

QUOTE:
${quoteText}

TIMING: ${timing}
DOOR SETUP: ${doorSetup}

ARIZONA BASELINE PRICING:
${baselinePricing}

Provide analysis in this format:

VERDICT: [green/yellow/red]
PRICE_CONTEXT: [1-2 sentences explaining if price is fair, within baseline, or has multiplier]
RED_FLAGS: [list each concern on new line, or "None seen"]
VENDOR_QUESTIONS: [2-3 specific questions to ask the vendor]
NEXT_STEP: [clear recommendation: negotiate/compare/proceed/walk away]

Rules:
- GREEN: Within baseline or reasonable after-hours markup
- YELLOW: Slightly high or needs clarification
- RED: Significantly overpriced or risky
- Apply ${timing === 'after-hours' ? '1.4-2.0x multiplier' : 'scheduled rates'}
- If this is springs-only work and the wire size is ≤ 0.250, scheduled pricing should generally not exceed $${ARIZONA_BASELINE.torsionSpringsMaxUpToWire250}
- Field benchmark (standard 16×7 door): oil-tempered springs-only is a red flag over $675; springs + any other torsion-system part (cables/bearings/drums/etc.) is a red flag over $700. If after-hours, multiple doors, or high-lift/custom/special conditions are involved, treat it as “needs explanation” instead of an automatic red.
- VENDOR_QUESTIONS must be non-confrontational. Use a curious, calm tone (e.g., start with “Can you help me understand…” / “Would you mind walking me through…”). If you flagged a red flag, include a question that asks the tech to explain it.
- IMPORTANT: Over the baseline does NOT automatically mean a bad price if premium parts/materials justify it. When pricing is above baseline, treat it as “needs explanation” unless it’s extreme or has other red flags.
- Premium justifications to check for (ask explicitly if relevant): oil-tempered vs water-tempered springs, wire sizes above 0.250, higher-cycle spring sets, upgraded hardware/bearing plates, nylon vs plastic rollers, better warranties.
- Prefer questions that request specifics: itemized breakdown (parts/labor/fees), exactly what’s being replaced, materials/specs (wire size/type for springs; roller material), after-hours justification, and warranty terms.
- Product intent: help homeowners understand typical pricing and request a clear explanation when a quote is above typical. A higher price can be fine if the tech can clearly explain the specs and what’s included.
- In NEXT_STEP: if the quote is above typical and the vendor cannot provide clear, specific answers (itemization/specs/warranty), recommend getting 1-2 more quotes.
- Flag duplicate charges, vague warranties, unnecessary upsells
- Be concise and use plain English`;
  }

  private formatBaselinePricing(): string {
    return `
Service Call: $${ARIZONA_BASELINE.serviceCall[0]}-$${ARIZONA_BASELINE.serviceCall[1]}
Torsion Springs (pair, 2-car insulated): $${ARIZONA_BASELINE.torsionSprings[0]}-$${ARIZONA_BASELINE.torsionSprings[1]} (springs-only ≤0.250 wire: typically ≤$${ARIZONA_BASELINE.torsionSpringsMaxUpToWire250} scheduled)
Rollers + Tune-up (single door): $${ARIZONA_BASELINE.rollers[0]}-$${ARIZONA_BASELINE.rollers[1]}
Opener Replacement (belt drive, 2-car): $${ARIZONA_BASELINE.opener[0]}-$${ARIZONA_BASELINE.opener[1]}
Panel Swap (2 panels, double insulated): $${ARIZONA_BASELINE.panelSwap[0]}-$${ARIZONA_BASELINE.panelSwap[1]}
Single Insulated Door: $${ARIZONA_BASELINE.singleDoor[0]}-$${ARIZONA_BASELINE.singleDoor[1]}
Double Insulated Door: $${ARIZONA_BASELINE.doubleDoor[0]}-$${ARIZONA_BASELINE.doubleDoor[1]}
Torsion Conversion: $${ARIZONA_BASELINE.torsionConversion[0]}-$${ARIZONA_BASELINE.torsionConversion[1]}
After-Hours: ${ARIZONA_BASELINE.afterHoursMultiplier[0]}x-${ARIZONA_BASELINE.afterHoursMultiplier[1]}x scheduled rate`;
  }

  private parseAIResponse(content: string, timing: JobTiming): AIAnalysisResult {
    const lines = content.split('\n').filter(l => l.trim());
    
    let verdict: QuoteVerdict = 'yellow';
    let priceContext = '';
    let redFlags: string[] = [];
    let vendorQuestions: string[] = [];
    let nextStep = '';

    let currentSection = '';

    for (const line of lines) {
      const lower = line.toLowerCase();
      
      if (lower.includes('verdict:')) {
        const match = line.match(/(green|yellow|red)/i);
        if (match) verdict = match[1].toLowerCase() as QuoteVerdict;
        currentSection = 'verdict';
      } else if (lower.includes('price_context:') || lower.includes('price context:')) {
        priceContext = line.split(':').slice(1).join(':').trim();
        currentSection = 'price_context';
      } else if (lower.includes('red_flags:') || lower.includes('red flags:')) {
        currentSection = 'red_flags';
        const content = line.split(':').slice(1).join(':').trim();
        if (content && !content.toLowerCase().includes('none')) {
          redFlags.push(content);
        }
      } else if (lower.includes('vendor_questions:') || lower.includes('vendor questions:')) {
        currentSection = 'vendor_questions';
        const content = line.split(':').slice(1).join(':').trim();
        if (content) vendorQuestions.push(content);
      } else if (lower.includes('next_step:') || lower.includes('next step:')) {
        nextStep = line.split(':').slice(1).join(':').trim();
        currentSection = 'next_step';
      } else if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
        const item = line.replace(/^[-•]\s*/, '').trim();
        if (currentSection === 'red_flags' && !item.toLowerCase().includes('none')) {
          redFlags.push(item);
        } else if (currentSection === 'vendor_questions') {
          vendorQuestions.push(item);
        }
      } else if (currentSection === 'price_context' && line.trim()) {
        priceContext += ' ' + line.trim();
      }
    }

    if (redFlags.length === 0) {
      redFlags = ['None seen'];
    }

    if (vendorQuestions.length === 0) {
      vendorQuestions = [
        'Can you help me understand what’s included in this price (parts, labor, and any fees)?',
        'Would you mind sharing the warranty details on parts and labor, in writing?',
      ];
    }

    return {
      verdict,
      priceContext: priceContext || 'Analysis completed.',
      redFlags,
      vendorQuestions: vendorQuestions.slice(0, 3),
      nextStep: nextStep || 'Review the analysis and decide how to proceed.',
    };
  }

  private applyHeuristics(
    base: AIAnalysisResult,
    inputText: string,
    timing: JobTiming,
    doorSetup: string
  ): AIAnalysisResult {
    const amount = extractLikelyTotalAmount(inputText);
    const signal = evaluateTorsionSpringPricing(inputText, amount, { timing, doorSetup });

    if (!signal.applied || !signal.verdict) return base;

    const redFlags = [...(base.redFlags || [])].filter((x) => x && x.toLowerCase() !== 'none seen');
    const vendorQuestions = [...(base.vendorQuestions || [])];

    if (signal.redFlag && !redFlags.some((f) => f.toLowerCase().includes('springs') && f.toLowerCase().includes('red flag'))) {
      redFlags.unshift(signal.redFlag);
    }

    if (signal.notes?.length) {
      for (const note of signal.notes) {
        const line = `Note: ${note}`;
        if (!redFlags.some((f) => f.toLowerCase() === line.toLowerCase())) {
          redFlags.push(line);
        }
      }
    }

    if (signal.vendorQuestion && !vendorQuestions.some((q) => q.toLowerCase().includes('itemized') || q.toLowerCase().includes('center bearing'))) {
      vendorQuestions.unshift(signal.vendorQuestion);
    }

    const verdictRank: Record<QuoteVerdict, number> = { green: 0, yellow: 1, red: 2 };
    const nextVerdict = verdictRank[signal.verdict] > verdictRank[base.verdict] ? signal.verdict : base.verdict;

    const nextPriceContext = base.priceContext
      ? `${base.priceContext} (Benchmark check applied for standard 16×7 torsion spring pricing.)`
      : 'Benchmark check applied for standard 16×7 torsion spring pricing.';

    return {
      ...base,
      verdict: nextVerdict,
      priceContext: nextPriceContext,
      redFlags: redFlags.length ? redFlags : ['None seen'],
      vendorQuestions: vendorQuestions.slice(0, 3),
    };
  }

  private getMockAnalysis(quoteText: string, timing: JobTiming, doorSetup?: string): AIAnalysisResult {
    // Simple mock analysis based on amount if we can extract it
    const amount = extractLikelyTotalAmount(quoteText);

    const lower = quoteText.toLowerCase();
    const hasSprings = lower.includes('spring');
    const hasOtherMajorWork =
      lower.includes('opener') ||
      lower.includes('roller') ||
      lower.includes('panel') ||
      lower.includes('full door') ||
      lower.includes('door replacement') ||
      lower.includes('cable') ||
      lower.includes('hinge');
    const springsOnly = hasSprings && !hasOtherMajorWork;

    let verdict: QuoteVerdict = 'yellow';
    let priceContext = '';
    const redFlags: string[] = [];
    const vendorQuestions: string[] = [];

    if (amount === 0) {
      verdict = 'yellow';
      priceContext = 'Unable to extract pricing from quote. Please verify with vendor.';
      redFlags.push('Quote format unclear');
      vendorQuestions.push('Would you mind providing an itemized breakdown of all charges (parts, labor, and any fees)?');
    } else if (springsOnly) {
      const scheduledCap = ARIZONA_BASELINE.torsionSpringsMaxUpToWire250;
      const minAfterHoursCap = Math.round(scheduledCap * ARIZONA_BASELINE.afterHoursMultiplier[0]);
      const maxAfterHoursCap = Math.round(scheduledCap * ARIZONA_BASELINE.afterHoursMultiplier[1]);
      const extremeMultiplier = 1.5;

      if (timing === 'after-hours') {
        if (amount > Math.round(maxAfterHoursCap * extremeMultiplier)) {
          verdict = 'red';
          priceContext = `Quote is $${amount}. For springs-only work, this is far beyond typical after-hours pricing. Unless there are unusual factors, it’s likely not competitive.`;
          redFlags.push('Springs-only price is an extreme outlier');
          vendorQuestions.push('Can you help me understand exactly why this is so high (wire size, spring type, cycle rating, and any added parts/fees)?');
        } else if (amount > maxAfterHoursCap) {
          verdict = 'yellow';
          priceContext = `Quote is $${amount}. For springs-only work, this is above the typical after-hours range, but it may be justified by premium parts/specs or additional included work.`;
          redFlags.push('Price is above typical range (needs explanation)');
          vendorQuestions.push('Would you mind walking me through what makes this a premium spring job (oil-tempered vs water-tempered, cycle rating, wire size >0.250)?');
          vendorQuestions.push('Can you help me understand exactly what’s included (service call, bearings, cables, tune-up, disposal, taxes/fees)?');
        } else if (amount > minAfterHoursCap) {
          verdict = 'yellow';
          priceContext = `Quote is $${amount}. For springs-only work (≤0.250 wire), this is on the high side but may be explained by after-hours pricing (≈${minAfterHoursCap}–${maxAfterHoursCap}).`;
          vendorQuestions.push('Would you mind confirming the spring wire size and spring type (oil-tempered vs water-tempered), and whether this includes a full tune-up and service call?');
        } else {
          verdict = 'green';
          priceContext = `Quote is $${amount}. Reasonable for after-hours springs-only service assuming standard wire size (≤0.250).`;
        }
      } else {
        if (amount > Math.round(scheduledCap * extremeMultiplier)) {
          verdict = 'red';
          priceContext = `Quote is $${amount}. For springs-only scheduled work, this is far above typical pricing. Unless there are unusual factors, it’s likely not competitive.`;
          redFlags.push('Springs-only price is an extreme outlier');
          vendorQuestions.push('Can you help me understand exactly why this is so high (wire size, spring type, cycle rating, and any added parts/fees)?');
        } else if (amount > scheduledCap) {
          verdict = 'yellow';
          priceContext = `Quote is $${amount}. This is above the common $${scheduledCap} benchmark for springs-only work at wire size ≤0.250, but it may be justified by premium springs/specs or additional included work.`;
          redFlags.push('Price is above typical range (needs explanation)');
          vendorQuestions.push('Would you mind confirming the spring wire size and whether it’s oil-tempered vs water-tempered (or higher-cycle springs)?');
          vendorQuestions.push('Can you help me understand what else is included beyond springs (bearings/hardware, tune-up, service call, fees)?');
        } else if (amount > ARIZONA_BASELINE.torsionSprings[1]) {
          verdict = 'yellow';
          priceContext = `Quote is $${amount}. For springs-only scheduled work this is higher than typical ($${ARIZONA_BASELINE.torsionSprings[0]}–$${ARIZONA_BASELINE.torsionSprings[1]}), but still under the common cap of ~$${scheduledCap} for ≤0.250 wire.`;
          vendorQuestions.push('Would you mind confirming the spring wire size and what warranty is included on parts and labor?');
        } else {
          verdict = 'green';
          priceContext = `Quote is $${amount}. Within the typical scheduled range for torsion springs in Arizona.`;
        }
      }
    } else if (timing === 'after-hours') {
      if (amount > 1000) {
        verdict = 'yellow';
        priceContext = `Quote is $${amount}. For after-hours service, typical markup is 1.4-2.0x. Verify this is justified.`;
        vendorQuestions.push('Can you help me understand why after-hours pricing is necessary here, and what the after-hours fee covers?');
      } else {
        verdict = 'green';
        priceContext = `Quote is $${amount}. Reasonable for after-hours emergency service.`;
      }
    } else {
      if (amount > 2000) {
        verdict = 'yellow';
        priceContext = `Quote is $${amount}. This is on the higher end. Compare with Arizona baseline pricing.`;
        redFlags.push('Price is above typical range (needs explanation)');
        vendorQuestions.push('Would you mind walking me through why the price is above the typical Arizona range for this job?');
      } else if (amount > 500) {
        verdict = 'green';
        priceContext = `Quote is $${amount}. Within reasonable range for scheduled service in Arizona.`;
      } else {
        verdict = 'green';
        priceContext = `Quote is $${amount}. Good price for scheduled service.`;
      }
    }

    vendorQuestions.push('Would you mind sharing the warranty details on parts and labor, in writing?');
    vendorQuestions.push('Can you confirm whether all parts are new (not refurbished), and list the brands/models?');

    const base: AIAnalysisResult = {
      verdict,
      priceContext,
      redFlags: redFlags.length > 0 ? redFlags : ['None seen'],
      vendorQuestions: vendorQuestions.slice(0, 3),
      nextStep: verdict === 'green'
        ? 'Price appears fair. Proceed if vendor is licensed.'
        : 'Ask the vendor questions listed above before proceeding.',
    };

    return this.applyHeuristics(base, quoteText, timing, doorSetup ?? '');
  }

  getBaselinePricing(): BaselinePricing {
    return ARIZONA_BASELINE;
  }
}
