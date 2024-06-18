import type { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

export interface TaskTable {
  id: ColumnType<`task_${string}`, `task_${string}` | undefined, never>;
  title: string;
  completed: ColumnType<boolean, never>;
}

export type Task = Selectable<TaskTable>;

export type NewTask = Insertable<Omit<TaskTable, 'id'>>;

export type ModifyTask = Updateable<TaskTable>;
