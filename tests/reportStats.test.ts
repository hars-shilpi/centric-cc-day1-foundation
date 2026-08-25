import {
  computeCostBuckets,
  computeOverdueSummary,
  computeStatusBreakdown,
  computeUserSummary,
  getDistinctUserIds,
} from '../src/legacy/reportStats';
import { Task } from '../src/repo/taskRepo';

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: 't1',
    userId: 'u1',
    title: 'Task',
    description: '',
    status: 'open',
    dueDate: '2026-01-01T00:00:00.000Z',
    cost: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

const NOW = new Date('2026-06-15T12:00:00.000Z');

describe('computeStatusBreakdown', () => {
  it('counts each status independently', () => {
    const tasks = [
      makeTask({ status: 'open' }),
      makeTask({ status: 'open' }),
      makeTask({ status: 'in_progress' }),
      makeTask({ status: 'done' }),
    ];
    expect(computeStatusBreakdown(tasks)).toEqual({ open: 2, inProgress: 1, done: 1 });
  });

  it('returns zeros for an empty list', () => {
    expect(computeStatusBreakdown([])).toEqual({ open: 0, inProgress: 0, done: 0 });
  });
});

describe('computeOverdueSummary', () => {
  it('counts overdue non-done tasks and collects their titles in order', () => {
    const tasks = [
      makeTask({ title: 'Late one', status: 'open', dueDate: '2026-06-01T00:00:00.000Z' }),
      makeTask({ title: 'On time', status: 'open', dueDate: '2026-06-20T00:00:00.000Z' }),
      makeTask({ title: 'Late but done', status: 'done', dueDate: '2026-06-01T00:00:00.000Z' }),
    ];
    expect(computeOverdueSummary(tasks, NOW)).toEqual({ count: 1, titles: ['Late one'] });
  });

  it('returns count 0 and no titles when nothing is overdue', () => {
    const tasks = [makeTask({ dueDate: '2026-06-20T00:00:00.000Z' })];
    expect(computeOverdueSummary(tasks, NOW)).toEqual({ count: 0, titles: [] });
  });
});

describe('computeCostBuckets', () => {
  it('tallies tasks into free/small/mid/large', () => {
    const tasks = [
      makeTask({ cost: 0 }),
      makeTask({ cost: 0.5 }),
      makeTask({ cost: 10 }),
      makeTask({ cost: 200 }),
    ];
    expect(computeCostBuckets(tasks)).toEqual({ free: 1, small: 1, mid: 1, large: 1 });
  });
});

describe('getDistinctUserIds', () => {
  it('preserves first-seen order and de-duplicates', () => {
    const tasks = [
      makeTask({ userId: 'u2' }),
      makeTask({ userId: 'u1' }),
      makeTask({ userId: 'u2' }),
    ];
    expect(getDistinctUserIds(tasks)).toEqual(['u2', 'u1']);
  });
});

describe('computeUserSummary', () => {
  it('aggregates only the given user\'s tasks', () => {
    const tasks = [
      makeTask({ userId: 'u1', status: 'open', cost: 10, dueDate: '2026-06-01T00:00:00.000Z' }),
      makeTask({ userId: 'u1', status: 'done', cost: 5, dueDate: '2026-06-01T00:00:00.000Z' }),
      makeTask({ userId: 'u2', status: 'open', cost: 100, dueDate: '2026-06-20T00:00:00.000Z' }),
    ];
    expect(computeUserSummary(tasks, 'u1', NOW)).toEqual({
      taskCount: 2,
      open: 1,
      inProgress: 0,
      done: 1,
      overdue: 1,
      totalCost: 15,
    });
  });

  it('returns zeros for a user with no tasks', () => {
    expect(computeUserSummary([], 'u1', NOW)).toEqual({
      taskCount: 0,
      open: 0,
      inProgress: 0,
      done: 0,
      overdue: 0,
      totalCost: 0,
    });
  });
});
