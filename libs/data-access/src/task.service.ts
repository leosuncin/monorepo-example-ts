import type { Kysely } from 'kysely';

import type { Database } from './database.js';
import { pika } from './pika.js';
import type { ModifyTask, NewTask, Task } from './task.table.js';

type TaskListOptions = Partial<{
  limit: number | undefined;
  offset: number | undefined;
  after: Task['id'] | string | undefined;
  s: Task['title'] | undefined;
}>;

export class TaskService {
  constructor(private readonly db: Kysely<Database>) {}

  createTask({ title }: NewTask): Promise<Task> {
    return this.db
      .insertInto('tasks')
      .values({
        id: pika.gen('task'),
        title,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async listTask({
    after,
    limit = 10,
    offset = 0,
    s,
  }: TaskListOptions): Promise<[tasks: Task[], count: number]> {
    let queryList = this.db.selectFrom('tasks').selectAll();
    let queryCount = this.db
      .selectFrom('tasks')
      .select(({ fn }) => fn.countAll<number>().as('total'));

    if (s) {
      queryList = queryList.where('title', 'like', `%${s}%`);
      queryCount = queryCount.where('title', 'like', `%${s}%`);
    }

    if (after) {
      queryList = queryList.where('id', '>', after as Task['id']);
      queryCount = queryCount.where('id', '>', after as Task['id']);
    } else {
      queryList = queryList.offset(offset);
    }

    queryList = queryList.limit(limit).orderBy('id desc');

    return Promise.all([
      queryList.execute(),
      queryCount.executeTakeFirstOrThrow().then(({ total }) => total),
    ]);
  }

  getTask(id: Task['id']): Promise<Task | undefined> {
    return this.db
      .selectFrom('tasks')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();
  }

  updateTask(id: Task['id'], changes: ModifyTask): Promise<Task | undefined> {
    return this.db
      .updateTable('tasks')
      .set(changes)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  toggleTasks(toggle: Pick<Task, 'completed'>): Promise<Task[]> {
    return this.db
      .updateTable('tasks')
      .set(toggle)
      .where('completed', '<>', toggle.completed)
      .returningAll()
      .execute();
  }

  removeTask(id: Task['id']): Promise<Task | undefined> {
    return this.db
      .deleteFrom('tasks')
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  clearTasks(completed?: Task['completed']): Promise<Task[]> {
    let query = this.db.deleteFrom('tasks');

    if (typeof completed === 'boolean') {
      query = query.where('completed', '=', completed);
    }

    return query.returningAll().execute();
  }
}
