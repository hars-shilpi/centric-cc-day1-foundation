import {
  classifyCostBucket,
  formatCostWithBucket,
  formatPlainCost,
  formatStatusLabel,
  truncateDescription,
} from '../src/legacy/reportFormatters';

describe('classifyCostBucket', () => {
  it('classifies boundary and interior values', () => {
    expect(classifyCostBucket(0)).toBe('free');
    expect(classifyCostBucket(0.5)).toBe('small');
    expect(classifyCostBucket(1)).toBe('mid');
    expect(classifyCostBucket(99.99)).toBe('mid');
    expect(classifyCostBucket(100)).toBe('large');
    expect(classifyCostBucket(500)).toBe('large');
  });
});

describe('formatStatusLabel', () => {
  it('maps known statuses', () => {
    expect(formatStatusLabel('open')).toBe('[OPEN]');
    expect(formatStatusLabel('in_progress')).toBe('[IN PROGRESS]');
    expect(formatStatusLabel('done')).toBe('[DONE]');
  });

  it('falls back to [UNKNOWN] for anything else', () => {
    expect(formatStatusLabel('archived')).toBe('[UNKNOWN]');
  });
});

describe('formatCostWithBucket', () => {
  it('formats free, small, mid, and large costs', () => {
    expect(formatCostWithBucket(0)).toBe('free');
    expect(formatCostWithBucket(0.3)).toBe('$0.30 (small)');
    expect(formatCostWithBucket(15.5)).toBe('$15.50');
    expect(formatCostWithBucket(250)).toBe('$250.00 (large)');
  });
});

describe('formatPlainCost', () => {
  it('never adds small/large suffixes', () => {
    expect(formatPlainCost(0)).toBe('free');
    expect(formatPlainCost(0.3)).toBe('$0.30');
    expect(formatPlainCost(250)).toBe('$250.00');
  });
});

describe('truncateDescription', () => {
  it('returns (none) for empty description', () => {
    expect(truncateDescription('')).toBe('(none)');
  });

  it('returns the description unchanged when at or under 40 chars', () => {
    const desc = 'a'.repeat(40);
    expect(truncateDescription(desc)).toBe(desc);
  });

  it('truncates and appends ... past 40 chars', () => {
    const desc = 'a'.repeat(41);
    expect(truncateDescription(desc)).toBe('a'.repeat(40) + '...');
  });
});
