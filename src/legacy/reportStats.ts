import { Task } from '../repo/taskRepo';
import { isOverdue } from '../util/dates';
import { sumCosts } from '../util/money';
import { classifyCostBucket } from './reportFormatters';

export interface StatusBreakdown {
  open: number;
  inProgress: number;
  done: number;
}

export function computeStatusBreakdown(tasks: Task[]): StatusBreakdown {
  let open = 0;
  let inProgress = 0;
  let done = 0;
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].status === 'open') {
      open = open + 1;
    } else if (tasks[i].status === 'in_progress') {
      inProgress = inProgress + 1;
    } else if (tasks[i].status === 'done') {
      done = done + 1;
    }
  }
  return { open, inProgress, done };
}

export interface OverdueSummary {
  count: number;
  titles: string[];
}

export function computeOverdueSummary(tasks: Task[], now: Date): OverdueSummary {
  let count = 0;
  const titles: string[] = [];
  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    if (t.status !== 'done' && isOverdue(t.dueDate, now)) {
      count = count + 1;
      titles.push(t.title);
    }
  }
  return { count, titles };
}

export interface CostBuckets {
  free: number;
  small: number;
  mid: number;
  large: number;
}

export function computeCostBuckets(tasks: Task[]): CostBuckets {
  let free = 0;
  let small = 0;
  let mid = 0;
  let large = 0;
  for (let i = 0; i < tasks.length; i++) {
    const bucket = classifyCostBucket(tasks[i].cost);
    if (bucket === 'free') {
      free = free + 1;
    } else if (bucket === 'small') {
      small = small + 1;
    } else if (bucket === 'mid') {
      mid = mid + 1;
    } else {
      large = large + 1;
    }
  }
  return { free, small, mid, large };
}

export function getDistinctUserIds(tasks: Task[]): string[] {
  const userIds: string[] = [];
  for (let i = 0; i < tasks.length; i++) {
    const uid = tasks[i].userId;
    let found = false;
    for (let j = 0; j < userIds.length; j++) {
      if (userIds[j] === uid) {
        found = true;
        break;
      }
    }
    if (!found) {
      userIds.push(uid);
    }
  }
  return userIds;
}

export interface UserSummary {
  taskCount: number;
  open: number;
  inProgress: number;
  done: number;
  overdue: number;
  totalCost: number;
}

export function computeUserSummary(tasks: Task[], userId: string, now: Date): UserSummary {
  let taskCount = 0;
  let open = 0;
  let inProgress = 0;
  let done = 0;
  let overdue = 0;
  const costs: number[] = [];

  for (let j = 0; j < tasks.length; j++) {
    const t = tasks[j];
    if (t.userId === userId) {
      taskCount = taskCount + 1;
      if (t.status === 'open') {
        open = open + 1;
      } else if (t.status === 'in_progress') {
        inProgress = inProgress + 1;
      } else if (t.status === 'done') {
        done = done + 1;
      }
      if (t.status !== 'done' && isOverdue(t.dueDate, now)) {
        overdue = overdue + 1;
      }
      costs.push(t.cost);
    }
  }

  return { taskCount, open, inProgress, done, overdue, totalCost: sumCosts(costs) };
}
