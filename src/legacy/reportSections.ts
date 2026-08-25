import { Task, User } from '../repo/taskRepo';
import { isOverdue } from '../util/dates';
import { sumCosts } from '../util/money';
import {
  formatCostWithBucket,
  formatPlainCost,
  formatStatusLabel,
  truncateDescription,
} from './reportFormatters';
import {
  computeCostBuckets,
  computeOverdueSummary,
  computeStatusBreakdown,
  computeUserSummary,
  getDistinctUserIds,
} from './reportStats';

export type LookupUser = (id: string) => User | undefined;

export function buildHeaderLines(generatedAt: Date): string[] {
  return [
    '=========================================',
    '           TASKFLOW STATUS REPORT',
    '=========================================',
    'Generated: ' + generatedAt.toISOString(),
    '',
  ];
}

export function buildSummaryLines(filteredTasks: Task[], now: Date): string[] {
  const lines: string[] = [];

  lines.push('Total tasks in scope: ' + filteredTasks.length);
  lines.push('');

  const breakdown = computeStatusBreakdown(filteredTasks);
  lines.push('Status breakdown:');
  lines.push('  open: ' + breakdown.open);
  lines.push('  in_progress: ' + breakdown.inProgress);
  lines.push('  done: ' + breakdown.done);
  lines.push('');

  const overdue = computeOverdueSummary(filteredTasks, now);
  lines.push('Overdue tasks: ' + overdue.count);
  if (overdue.count > 0) {
    lines.push('  titles: ' + overdue.titles.join(', '));
  }
  lines.push('');

  const allCosts: number[] = [];
  for (let i = 0; i < filteredTasks.length; i++) {
    allCosts.push(filteredTasks[i].cost);
  }
  lines.push('Total cost across scope: $' + sumCosts(allCosts).toFixed(2));
  lines.push('');

  return lines;
}

export function buildPerUserSectionLines(
  filteredTasks: Task[],
  now: Date,
  lookupUser: LookupUser,
): string[] {
  const lines: string[] = [];

  lines.push('-----------------------------------------');
  lines.push('PER-USER BREAKDOWN');
  lines.push('-----------------------------------------');

  const userIds = getDistinctUserIds(filteredTasks);

  for (let i = 0; i < userIds.length; i++) {
    const uid = userIds[i];
    const user = lookupUser(uid);
    const userName = user ? user.name : 'Unknown';

    lines.push('');
    lines.push('User: ' + userName + ' (' + uid + ')');

    const summary = computeUserSummary(filteredTasks, uid, now);

    lines.push('  tasks: ' + summary.taskCount);
    lines.push(
      '  open: ' + summary.open + ', in_progress: ' + summary.inProgress + ', done: ' + summary.done,
    );
    lines.push('  overdue: ' + summary.overdue);
    lines.push('  cost: $' + summary.totalCost.toFixed(2));

    lines.push('  task list:');
    for (let j = 0; j < filteredTasks.length; j++) {
      const t = filteredTasks[j];
      if (t.userId === uid) {
        const statusLabel = formatStatusLabel(t.status);
        const overdueLabel = t.status !== 'done' && isOverdue(t.dueDate, now) ? ' (OVERDUE)' : '';
        const costLabel = formatCostWithBucket(t.cost);
        lines.push('    - ' + statusLabel + overdueLabel + ' ' + t.title + ' -- ' + costLabel);
      }
    }
  }

  return lines;
}

export function buildTaskDetailSectionLines(
  filteredTasks: Task[],
  now: Date,
  lookupUser: LookupUser,
): string[] {
  const lines: string[] = [];

  lines.push('');
  lines.push('-----------------------------------------');
  lines.push('TASK DETAIL (WITH OWNER LOOKUP)');
  lines.push('-----------------------------------------');

  for (let i = 0; i < filteredTasks.length; i++) {
    const t = filteredTasks[i];
    const owner = lookupUser(t.userId);
    const ownerName = owner ? owner.name : 'Unknown';
    const ownerEmail = owner ? owner.email : 'unknown@taskflow.dev';

    lines.push('');
    lines.push('Task ' + t.id + ': ' + t.title);
    lines.push('  owner: ' + ownerName + ' <' + ownerEmail + '>');
    lines.push('  status: ' + t.status);
    lines.push('  due: ' + t.dueDate);

    if (t.status !== 'done') {
      if (isOverdue(t.dueDate, now)) {
        lines.push('  ** OVERDUE **');
      } else {
        lines.push('  on track');
      }
    } else {
      lines.push('  completed');
    }

    lines.push('  desc: ' + truncateDescription(t.description));
    lines.push('  cost: ' + formatPlainCost(t.cost));
  }

  return lines;
}

export function buildCostBucketsSectionLines(filteredTasks: Task[]): string[] {
  const lines: string[] = [];

  lines.push('');
  lines.push('-----------------------------------------');
  lines.push('COST BUCKETS');
  lines.push('-----------------------------------------');

  const buckets = computeCostBuckets(filteredTasks);

  lines.push('  free: ' + buckets.free);
  lines.push('  small (<$1): ' + buckets.small);
  lines.push('  mid ($1-$100): ' + buckets.mid);
  lines.push('  large (>$100): ' + buckets.large);

  return lines;
}

export function buildFooterLines(): string[] {
  return ['', '=========================================', 'END OF REPORT', '========================================='];
}
