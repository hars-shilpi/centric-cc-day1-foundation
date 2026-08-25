import { filterTasks } from '../src/legacy/reportFilters';
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

describe('filterTasks', () => {
  it('returns all tasks when no filters are applied', () => {
    const tasks = [makeTask({ id: 't1' }), makeTask({ id: 't2', status: 'done' })];
    expect(filterTasks(tasks, { includeZeroCost: true })).toEqual(tasks);
  });

  it('excludes zero-cost tasks when includeZeroCost is false', () => {
    const tasks = [
      makeTask({ id: 't1', cost: 0 }),
      makeTask({ id: 't2', cost: 5 }),
    ];
    const result = filterTasks(tasks, { includeZeroCost: false });
    expect(result.map((t) => t.id)).toEqual(['t2']);
  });

  it('filters by status when statusFilter is set', () => {
    const tasks = [
      makeTask({ id: 't1', status: 'open' }),
      makeTask({ id: 't2', status: 'done' }),
    ];
    const result = filterTasks(tasks, { statusFilter: 'done', includeZeroCost: true });
    expect(result.map((t) => t.id)).toEqual(['t2']);
  });

  it('combines statusFilter and includeZeroCost=false', () => {
    const tasks = [
      makeTask({ id: 't1', status: 'open', cost: 0 }),
      makeTask({ id: 't2', status: 'open', cost: 5 }),
      makeTask({ id: 't3', status: 'done', cost: 5 }),
    ];
    const result = filterTasks(tasks, { statusFilter: 'open', includeZeroCost: false });
    expect(result.map((t) => t.id)).toEqual(['t2']);
  });

  it('returns an empty array when nothing matches', () => {
    const tasks = [makeTask({ id: 't1', status: 'open' })];
    expect(filterTasks(tasks, { statusFilter: 'done', includeZeroCost: true })).toEqual([]);
  });
});
