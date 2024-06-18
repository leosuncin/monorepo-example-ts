import assert from 'node:assert/strict';
import { test } from 'node:test';

import fc from 'fast-check';

import { ErrorResponse, QueryTasks, TasksPaginated } from './api.schema';

test('validate an error response', () => {
  fc.assert(
    fc.property(
      fc.record(
        {
          message: fc.string({ minLength: 1 }),
          cause: fc.array(fc.object()),
        },
        { requiredKeys: ['message'] },
      ),
      (data) => {
        const result = ErrorResponse.safeParse(data);

        assert.ok(result.success);
        assert.ok(Object.hasOwn(result, 'data'));
        assert.deepStrictEqual(result.data, data);
      },
    ),
  );
});

test('validate query tasks', () => {
  fc.assert(
    fc.property(
      fc.record({
        after: fc.hexaString({ minLength: 1 }).map((hexa) => `task_${hexa}`),
        limit: fc.integer({ min: 2, max: 100 }).map(String),
        page: fc.integer({ min: 1 }).map(String),
        s: fc.string({ minLength: 1 }),
      }),
      (data) => {
        const result = QueryTasks.safeParse(data);

        assert.ok(result.success);
        assert.ok(Object.hasOwn(result, 'data'));
        assert.deepStrictEqual(result.data, {
          ...data,
          limit: Number(data.limit),
          page: Number(data.page),
          offset: Number(data.limit) * (Number(data.page) - 1),
        });
      },
    ),
  );
});

test('validate tasks paginated', () => {
  fc.assert(
    fc.property(
      fc.record({
        data: fc.array(
          fc.record(
            {
              id: fc.hexaString().map((hexa) => `task_${hexa}`),
              title: fc.string({ minLength: 1, maxLength: 255 }),
              completed: fc.boolean(),
            },
            { requiredKeys: ['id', 'title', 'completed'] },
          ),
          { minLength: 2, maxLength: 100 },
        ),
        metadata: fc.record({
          itemsPerPage: fc.integer({ min: 2, max: 100 }),
          totalItems: fc.integer({ min: 1 }),
          itemCount: fc.integer({ min: 1 }),
          currentPage: fc.integer({ min: 1 }),
          totalPages: fc.integer({ min: 1 }),
        }),
      }),
      (data) => {
        const result = TasksPaginated.safeParse(data);
        if (!result.success) console.log(result.error);

        assert.ok(result.success);
        assert.ok(Object.hasOwn(result, 'data'));
        assert.deepStrictEqual(result.data, data);
      },
    ),
  );
});
