import { evaluateTorsionSpringPricing } from './torsionHeuristics';

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

function run(): void {
  // 1) Springs-only oil-tempered over 675 => red (scheduled, standard 16x7)
  {
    const text = 'Replace oil tempered torsion springs (springs only). Total $725.';
    const signal = evaluateTorsionSpringPricing(text, 725, { timing: 'scheduled', doorSetup: 'double 7ft' });
    assert(signal.applied, 'expected heuristic to apply');
    assert(signal.verdict === 'red', `expected red, got ${signal.verdict}`);
  }

  // 2) Springs-only but no oil-tempered mention => do not apply
  {
    const text = 'Replace torsion springs (springs only). Total $800.';
    const signal = evaluateTorsionSpringPricing(text, 800, { timing: 'scheduled', doorSetup: 'double 7ft' });
    assert(!signal.applied, 'expected heuristic to not apply without oil-tempered signal');
  }

  // 3) Springs + torsion part over 700 => red (scheduled, standard 16x7)
  {
    const text = 'Replace torsion springs and cables. Total $795.';
    const signal = evaluateTorsionSpringPricing(text, 795, { timing: 'scheduled', doorSetup: 'double 7ft' });
    assert(signal.applied, 'expected heuristic to apply');
    assert(signal.verdict === 'red', `expected red, got ${signal.verdict}`);
  }

  // 4) Same, but after-hours => downgraded to yellow
  {
    const text = 'Replace torsion springs and cables. Total $795.';
    const signal = evaluateTorsionSpringPricing(text, 795, { timing: 'after-hours', doorSetup: 'double 7ft' });
    assert(signal.applied, 'expected heuristic to apply');
    assert(signal.verdict === 'yellow', `expected yellow due to after-hours, got ${signal.verdict}`);
  }

  // 5) Standard check uncertainty => downgraded to yellow
  {
    const text = 'Replace oil-tempered springs only. Total $725.';
    const signal = evaluateTorsionSpringPricing(text, 725, { timing: 'scheduled', doorSetup: '' });
    assert(signal.applied, 'expected heuristic to apply');
    assert(signal.verdict === 'yellow', `expected yellow due to unknown door setup, got ${signal.verdict}`);
  }

  console.log('torsionHeuristics.selftest: OK');
}

run();
