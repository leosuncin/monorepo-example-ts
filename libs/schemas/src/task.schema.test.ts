import assert from 'node:assert/strict';
import { test } from 'node:test';

import fc from 'fast-check';

import { ModifyTask, NewTask, Task, TaskId, ToggleTask } from './task.schema';

test('validate a new task', () => {
  fc.assert(
    fc.property(fc.string({ minLength: 1, maxLength: 255 }), (title) => {
      const result = NewTask.safeParse({ title });

      assert.ok(result.success);
      assert.ok(Object.hasOwn(result, 'data'));
      assert.equal(result.data.title, title);
    }),
  );
});

test('validate of modify a task', () => {
  fc.assert(
    fc.property(
      fc.oneof(
        fc.record(
          {
            title: fc.string({ minLength: 1, maxLength: 255 }),
          },
          { requiredKeys: ['title'] },
        ),
        fc.record(
          {
            completed: fc.boolean(),
          },
          { requiredKeys: ['completed'] },
        ),
      ),
      (data) => {
        const result = ModifyTask.safeParse(data);

        assert.ok(result.success);
        assert.ok(Object.hasOwn(result, 'data'));
        assert.deepStrictEqual(result.data, data);
      },
    ),
  );
});

test('validate of toggle task', () => {
  fc.assert(
    fc.property(fc.boolean(), (completed) => {
      const result = ToggleTask.safeParse({ completed });

      assert.ok(result.success);
      assert.ok(Object.hasOwn(result, 'data'));
      assert.equal(result.data.completed, completed);
    }),
  );
});

test('validate a task', () => {
  fc.assert(
    fc.property(
      fc.record(
        {
          id: fc.hexaString().map((hexa) => `task_${hexa}`),
          title: fc.string({ minLength: 1, maxLength: 255 }),
          completed: fc.boolean(),
        },
        { requiredKeys: ['id', 'title', 'completed'] },
      ),
      (data) => {
        const result = Task.safeParse(data);

        assert.ok(result.success);
        assert.ok(Object.hasOwn(result, 'data'));
        assert.deepStrictEqual(result.data, data);
      },
    ),
  );
});

test('validate that is a task id', () => {
  fc.assert(
    fc.property(
      fc.hexaString().map((hexa) => `task_${hexa}`),
      (id) => {
        const result = TaskId.safeParse({ id });

        assert.ok(result.success);
        assert.ok(Object.hasOwn(result, 'data'));
        assert.deepStrictEqual(result.data.id, id);
      },
    ),
  );
});
