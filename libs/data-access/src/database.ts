import type { TaskTable } from './task.table.js';

export interface Database {
  tasks: TaskTable;
}
