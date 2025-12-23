import { AIAnalysisResult, QuoteVerdict, JobTiming, BaselinePricing } from '../types';

// Arizona baseline pricing reference
const ARIZONA_BASELINE: BaselinePricing = {
  serviceCall: [75, 150],
  torsionSprings: [320, 520],
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
      return this.getMockAnalysis(quoteText, timing);
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
      
      return this.parseAIResponse(content, timing);
    } catch (error) {
      console.error('Error analyzing quote with AI:', error);
      // Fallback to mock analysis
      return this.getMockAnalysis(quoteText, timing);
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
- Flag duplicate charges, vague warranties, unnecessary upsells
- Be concise and use plain English`;
  }

  private formatBaselinePricing(): string {
    return `
Service Call: $${ARIZONA_BASELINE.serviceCall[0]}-$${ARIZONA_BASELINE.serviceCall[1]}
Torsion Springs (pair, 2-car insulated): $${ARIZONA_BASELINE.torsionSprings[0]}-$${ARIZONA_BASELINE.torsionSprings[1]}
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

    return {
      verdict,
      priceContext: priceContext || 'Analysis completed.',
      redFlags,
      vendorQuestions: vendorQuestions.slice(0, 3),
      nextStep: nextStep || 'Review the analysis and decide how to proceed.',
    };
  }

  private getMockAnalysis(quoteText: string, timing: JobTiming): AIAnalysisResult {
    // Simple mock analysis based on amount if we can extract it
    const amountMatch = quoteText.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

    let verdict: QuoteVerdict = 'yellow';
    let priceContext = '';
    const redFlags: string[] = [];
    const vendorQuestions: string[] = [];

    if (amount === 0) {
      verdict = 'yellow';
      priceContext = 'Unable to extract pricing from quote. Please verify with vendor.';
      redFlags.push('Quote format unclear');
      vendorQuestions.push('Can you provide a detailed breakdown of all charges?');
    } else if (timing === 'after-hours') {
      if (amount > 1000) {
        verdict = 'yellow';
        priceContext = `Quote is $${amount}. For after-hours service, typical markup is 1.4-2.0x. Verify this is justified.`;
        vendorQuestions.push('Why is after-hours pricing necessary?');
      } else {
        verdict = 'green';
        priceContext = `Quote is $${amount}. Reasonable for after-hours emergency service.`;
      }
    } else {
      if (amount > 2000) {
        verdict = 'yellow';
        priceContext = `Quote is $${amount}. This is on the higher end. Compare with Arizona baseline pricing.`;
        redFlags.push('Price is above typical range');
        vendorQuestions.push('Can you justify the pricing relative to Arizona market rates?');
      } else if (amount > 500) {
        verdict = 'green';
        priceContext = `Quote is $${amount}. Within reasonable range for scheduled service in Arizona.`;
      } else {
        verdict = 'green';
        priceContext = `Quote is $${amount}. Good price for scheduled service.`;
      }
    }

    vendorQuestions.push('What warranty do you provide on parts and labor?');
    vendorQuestions.push('Are all parts new or refurbished?');

    return {
      verdict,
      priceContext,
      redFlags: redFlags.length > 0 ? redFlags : ['None seen'],
      vendorQuestions: vendorQuestions.slice(0, 3),
      nextStep: verdict === 'green' 
        ? 'Price appears fair. Proceed if vendor is licensed.'
        : 'Ask the vendor questions listed above before proceeding.',
    };
  }

  getBaselinePricing(): BaselinePricing {
    return ARIZONA_BASELINE;
  }
}
