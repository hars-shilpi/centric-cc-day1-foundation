export type CostBucket = 'free' | 'small' | 'mid' | 'large';

export function classifyCostBucket(cost: number): CostBucket {
  if (cost === 0) return 'free';
  if (cost < 1) return 'small';
  if (cost < 100) return 'mid';
  return 'large';
}

export function formatStatusLabel(status: string): string {
  if (status === 'open') return '[OPEN]';
  if (status === 'in_progress') return '[IN PROGRESS]';
  if (status === 'done') return '[DONE]';
  return '[UNKNOWN]';
}

export function formatCostWithBucket(cost: number): string {
  const bucket = classifyCostBucket(cost);
  if (bucket === 'free') return 'free';
  if (bucket === 'small') return '$' + cost.toFixed(2) + ' (small)';
  if (bucket === 'mid') return '$' + cost.toFixed(2);
  return '$' + cost.toFixed(2) + ' (large)';
}

export function formatPlainCost(cost: number): string {
  if (cost === 0) return 'free';
  return '$' + cost.toFixed(2);
}

export function truncateDescription(description: string, maxLen = 40): string {
  if (!description) return '(none)';
  if (description.length > maxLen) {
    return description.substring(0, maxLen) + '...';
  }
  return description;
}
