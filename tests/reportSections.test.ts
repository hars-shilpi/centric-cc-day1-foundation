import {
  buildCostBucketsSectionLines,
  buildFooterLines,
  buildHeaderLines,
  buildPerUserSectionLines,
  buildSummaryLines,
  buildTaskDetailSectionLines,
} from '../src/legacy/reportSections';
import { Task, User } from '../src/repo/taskRepo';

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

const USERS: Record<string, User> = {
  u1: { id: 'u1', name: 'Ada Lovelace', email: 'ada@taskflow.dev' },
};

function lookupUser(id: string): User | undefined {
  return USERS[id];
}

describe('buildHeaderLines', () => {
  it('renders the banner and generated timestamp', () => {
    expect(buildHeaderLines(NOW)).toEqual([
      '=========================================',
      '           TASKFLOW STATUS REPORT',
      '=========================================',
      'Generated: ' + NOW.toISOString(),
      '',
    ]);
  });
});

describe('buildSummaryLines', () => {
  it('includes total count, status breakdown, overdue titles, and total cost', () => {
    const tasks = [
      makeTask({ title: 'Late one', status: 'open', dueDate: '2026-06-01T00:00:00.000Z', cost: 10 }),
      makeTask({ title: 'Done one', status: 'done', dueDate: '2026-06-01T00:00:00.000Z', cost: 5 }),
    ];
    const lines = buildSummaryLines(tasks, NOW);
    expect(lines).toContain('Total tasks in scope: 2');
    expect(lines).toContain('  open: 1');
    expect(lines).toContain('  done: 1');
    expect(lines).toContain('Overdue tasks: 1');
    expect(lines).toContain('  titles: Late one');
    expect(lines).toContain('Total cost across scope: $15.00');
  });

  it('omits the titles line when nothing is overdue', () => {
    const lines = buildSummaryLines([], NOW);
    expect(lines).toContain('Overdue tasks: 0');
    expect(lines.some((l) => l.startsWith('  titles:'))).toBe(false);
  });
});

describe('buildPerUserSectionLines', () => {
  it('renders a user block with task list entries', () => {
    const tasks = [
      makeTask({ userId: 'u1', title: 'Fix bug', status: 'open', cost: 0.5, dueDate: '2026-06-01T00:00:00.000Z' }),
    ];
    const lines = buildPerUserSectionLines(tasks, NOW, lookupUser);
    expect(lines).toContain('User: Ada Lovelace (u1)');
    expect(lines).toContain('  tasks: 1');
    expect(lines).toContain('    - [OPEN] (OVERDUE) Fix bug -- $0.50 (small)');
  });

  it('labels an unknown user id as Unknown', () => {
    const tasks = [makeTask({ userId: 'u9' })];
    const lines = buildPerUserSectionLines(tasks, NOW, lookupUser);
    expect(lines).toContain('User: Unknown (u9)');
  });
});

describe('buildTaskDetailSectionLines', () => {
  it('renders owner, status, and cost for each task', () => {
    const tasks = [
      makeTask({ id: 't7', userId: 'u1', title: 'Fix bug', status: 'done', cost: 0, description: 'short' }),
    ];
    const lines = buildTaskDetailSectionLines(tasks, NOW, lookupUser);
    expect(lines).toContain('Task t7: Fix bug');
    expect(lines).toContain('  owner: Ada Lovelace <ada@taskflow.dev>');
    expect(lines).toContain('  completed');
    expect(lines).toContain('  desc: short');
    expect(lines).toContain('  cost: free');
  });

  it('falls back to Unknown owner details when the user cannot be found', () => {
    const tasks = [makeTask({ userId: 'u9' })];
    const lines = buildTaskDetailSectionLines(tasks, NOW, lookupUser);
    expect(lines).toContain('  owner: Unknown <unknown@taskflow.dev>');
  });
});

describe('buildCostBucketsSectionLines', () => {
  it('tallies bucket counts', () => {
    const tasks = [makeTask({ cost: 0 }), makeTask({ cost: 200 })];
    const lines = buildCostBucketsSectionLines(tasks);
    expect(lines).toContain('  free: 1');
    expect(lines).toContain('  large (>$100): 1');
  });
});

describe('buildFooterLines', () => {
  it('renders the closing banner', () => {
    expect(buildFooterLines()).toEqual([
      '',
      '=========================================',
      'END OF REPORT',
      '=========================================',
    ]);
  });
});
