import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { setTimeout as waitFor } from 'node:timers/promises';

import SQLite from 'better-sqlite3';
import { Kysely, SqliteDialect, sql } from 'kysely';
import { SerializePlugin } from 'kysely-plugin-serialize';

import type { Database } from '../src/database';
import { TaskService } from '../src/task.service';

export const database = new Kysely<Database>({
  dialect: new SqliteDialect({
    database: new SQLite(':memory:'),
  }),
  plugins: [new SerializePlugin()],
});

describe('TaskService', () => {
  let taskService: TaskService;

  beforeEach(async () => {
    await database.schema
      .createTable('tasks')
      .addColumn('id', 'text', (col) => col.primaryKey())
      .addColumn('title', 'text', (col) =>
        col.notNull().check(sql`LENGTH(title) > 0`),
      )
      .addColumn('completed', 'varchar(5)', (col) =>
        col
          .notNull()
          .defaultTo('false')
          .check(sql`completed = 'true' OR completed = 'false'`),
      )
      .execute();
    taskService = new TaskService(database);
  });

  afterEach(async () => {
    await database.schema.dropTable('tasks').execute();
  });

  it('insert a new task', async () => {
    const task = await taskService.createTask({ title: 'Buy milk' });

    assert.ok(Object.hasOwn(task, 'id'));
    assert.equal(task.title, 'Buy milk');
    assert.equal(task.completed, false);
  });

  it('list the tasks', async () => {
    await taskService.createTask({ title: 'Buy milk' });
    await taskService.createTask({ title: 'Buy eggs' });

    const [tasks, count] = await taskService.listTask({});

    assert.equal(tasks.length, 2);
    assert.equal(count, 2);
  });

  it('list the tasks with a search query', async () => {
    await taskService.createTask({ title: 'Buy milk' });
    await taskService.createTask({ title: 'Buy eggs' });

    const [tasks, count] = await taskService.listTask({ s: 'milk' });

    assert.equal(tasks.length, 1);
    assert.equal(count, 1);
  });

  it('list the tasks with pagination', async () => {
    await taskService.createTask({ title: 'Buy milk' });
    await taskService.createTask({ title: 'Buy eggs' });

    const [tasks, count] = await taskService.listTask({ limit: 1 });

    assert.equal(tasks.length, 1);
    assert.equal(count, 2);
  });

  it('list the tasks after another task', async () => {
    await taskService.createTask({ title: 'Buy milk' });
    await waitFor(100);
    const { id: after } = await taskService.createTask({ title: 'Buy eggs' });
    await waitFor(100);
    const lastTask = await taskService.createTask({ title: 'Buy bread' });

    const [tasks, count] = await taskService.listTask({ after });

    assert.equal(tasks.length, 1);
    assert.equal(count, 1);
    assert.deepStrictEqual(tasks, [lastTask]);
  });

  it('get a task', async () => {
    const { id } = await taskService.createTask({ title: 'Buy milk' });
    const task = await taskService.getTask(id);

    assert.ok(task);
    assert.equal(task.title, 'Buy milk');
    assert.equal(task.completed, false);
    assert.equal(task.id, id);
  });

  it('update a task', async () => {
    const { id } = await taskService.createTask({ title: 'Buy milk' });
    const task = await taskService.updateTask(id, { completed: true });

    assert.ok(task);
    assert.equal(task.title, 'Buy milk');
    assert.equal(task.completed, true);
    assert.equal(task.id, id);
  });

  it('toggle tasks', async () => {
    const task1 = await taskService.createTask({ title: 'Buy milk' });
    const task2 = await taskService.createTask({ title: 'Buy eggs' });

    const [updatedTask1, updatedTask2] = await taskService.toggleTasks({
      completed: true,
    });

    assert.ok(updatedTask1);
    assert.ok(updatedTask2);
    assert.equal(updatedTask1.completed, true);
    assert.equal(updatedTask2.completed, true);
    assert.equal(updatedTask1.id, task1.id);
    assert.equal(updatedTask2.id, task2.id);
  });

  it('delete a task', async () => {
    const { id } = await taskService.createTask({ title: 'Buy milk' });
    const task = await taskService.removeTask(id);

    assert.ok(task);
    assert.equal(task.title, 'Buy milk');
    assert.equal(task.completed, false);
    assert.equal(task.id, id);
  });

  it('delete all the tasks', async () => {
    await taskService.createTask({ title: 'Buy milk' });
    await taskService.createTask({ title: 'Buy eggs' });

    const tasks = await taskService.clearTasks();

    assert.equal(tasks.length, 2);
  });

  it('delete all the completed tasks', async () => {
    await taskService
      .createTask({ title: 'Buy milk' })
      .then((task) => taskService.updateTask(task.id, { completed: true }));
    await taskService.createTask({ title: 'Buy eggs' });

    const tasks = await taskService.clearTasks(true);

    assert.equal(tasks.length, 1);
  });
});
