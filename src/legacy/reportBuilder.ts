import * as taskRepo from '../repo/taskRepo';
import * as userService from '../services/userService';
import { filterTasks } from './reportFilters';
import {
  buildCostBucketsSectionLines,
  buildFooterLines,
  buildHeaderLines,
  buildPerUserSectionLines,
  buildSummaryLines,
  buildTaskDetailSectionLines,
} from './reportSections';

export function buildReport(options?: {
  generatedAt?: Date;
  statusFilter?: string;
  includeZeroCost?: boolean;
}): string {
  const generatedAt = options?.generatedAt ?? new Date();
  const includeZeroCost = options?.includeZeroCost ?? true;

  const filteredTasks = filterTasks(taskRepo.listTasks(), {
    statusFilter: options?.statusFilter,
    includeZeroCost,
  });

  const lines: string[] = [
    ...buildHeaderLines(generatedAt),
    ...buildSummaryLines(filteredTasks, generatedAt),
    ...buildPerUserSectionLines(filteredTasks, generatedAt, userService.getById),
    ...buildTaskDetailSectionLines(filteredTasks, generatedAt, userService.getById),
    ...buildCostBucketsSectionLines(filteredTasks),
    ...buildFooterLines(),
  ];

  return lines.join('\n');
}
