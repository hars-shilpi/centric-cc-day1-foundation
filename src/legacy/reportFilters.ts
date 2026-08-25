import { Task } from '../repo/taskRepo';

export function filterTasks(
  tasks: Task[],
  options: { statusFilter?: string; includeZeroCost: boolean },
): Task[] {
  const { statusFilter, includeZeroCost } = options;
  const filtered: Task[] = [];

  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    if (statusFilter) {
      if (t.status === statusFilter) {
        if (!includeZeroCost) {
          if (t.cost > 0) {
            filtered.push(t);
          }
        } else {
          filtered.push(t);
        }
      }
    } else {
      if (!includeZeroCost) {
        if (t.cost > 0) {
          filtered.push(t);
        }
      } else {
        filtered.push(t);
      }
    }
  }

  return filtered;
}
