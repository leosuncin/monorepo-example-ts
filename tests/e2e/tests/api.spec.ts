import { faker } from '@faker-js/faker';
import type { ServerRequests } from '@monorepo/contract';
import { test, expect } from '@playwright/test';

const BACKEND_URL = process.env['BACKEND_URL'] ?? 'http://localhost:3030';

test('create a new task', async ({ request }) => {
  const data: ServerRequests<'createTask'> = { title: faker.lorem.sentence() };
  const response = await request.post(`${BACKEND_URL}/tasks`, { data });

  expect(response.status()).toBe(201);
  await expect(response.json()).resolves.toMatchObject({
    completed: false,
    id: expect.stringMatching(/^task_\w+/),
    title: data.title,
  });
});

test('list the tasks', async ({ request }) => {
  const response = await request.get(`${BACKEND_URL}/tasks`);

  expect(response.status()).toBe(200);
  await expect(response.json()).resolves.toMatchObject({
    data: expect.arrayContaining([expect.anything()]),
    metadata: expect.objectContaining({
      itemsPerPage: 10,
      totalItems: expect.any(Number),
      itemCount: expect.any(Number),
      currentPage: 1,
      totalPages: 1,
    }),
  });
});
