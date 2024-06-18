/* eslint-disable @typescript-eslint/no-floating-promises */
import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import { after, before, describe, it } from 'node:test';

import { ClientResponses, contract } from '@monorepo/contract';
import { initClient } from '@ts-rest/core';
import { listen } from 'async-listen';

import { app } from '../src/app.js';

describe('ToDoMVC API', () => {
  let server: Server;
  // first assign it, so the client is typed correctly
  let client = initClient(contract, { baseUrl: '' });

  before(async () => {
    server = createServer(app);
    const address = await listen(server);
    client = initClient(contract, {
      baseUrl: address.toString().replace(/\/$/, ''),
      throwOnUnknownStatus: true,
    });
  });

  after(() => server.close());

  it('create a new task', async () => {
    const response: ClientResponses['createTask'] = await client.createTask({
      body: { title: 'New Task' },
    });

    assert.equal(response.status, 201);
    assert.equal(response.body.title, 'New Task');
    assert.equal(response.body.completed, false);
  });

  it('list tasks', async () => {
    const response: ClientResponses['listTasks'] = await client.listTasks();

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.metadata.currentPage, 1);
    assert.equal(response.body.metadata.itemCount, 1);
    assert.equal(response.body.metadata.itemsPerPage, 10);
    assert.equal(response.body.metadata.totalItems, 1);
    assert.equal(response.body.metadata.totalPages, 1);
  });

  it('get one task by its id', async () => {
    const createdResponse: ClientResponses['createTask'] =
      await client.createTask({
        body: { title: 'New Task' },
      });

    const response: ClientResponses['getTask'] = await client.getTask({
      params: { id: createdResponse.body.id },
    });

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, createdResponse.body);
  });
  it('update a task', async () => {
    const createdResponse: ClientResponses['createTask'] =
      await client.createTask({
        body: { title: 'New Task' },
      });

    const response: ClientResponses['updateTask'] = await client.updateTask({
      params: { id: createdResponse.body.id },
      body: { title: 'Updated Task' },
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.title, 'Updated Task');
  });

  it('complete a task', async () => {
    const createdResponse: ClientResponses['createTask'] =
      await client.createTask({
        body: { title: 'New Task' },
      });

    const response: ClientResponses['updateTask'] = await client.updateTask({
      params: { id: createdResponse.body.id },
      body: { completed: true },
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.completed, true);
  });

  it('remove a task', async () => {
    const createdResponse: ClientResponses['createTask'] =
      await client.createTask({
        body: { title: 'New Task' },
      });

    const response: ClientResponses['removeTask'] = await client.removeTask({
      params: { id: createdResponse.body.id },
      body: undefined,
    });

    assert.equal(response.status, 204);
  });

  it('toggle all of the tasks', async () => {
    await client.createTask({ body: { title: 'Task 1' } });
    await client.createTask({ body: { title: 'Task 2' } });

    const response: ClientResponses['toggleTasks'] = await client.toggleTasks({
      body: { completed: true },
    });

    assert.equal(response.status, 200);
    assert.ok(response.body.every((task) => task.completed));
  });

  it('clear all of the completed tasks', async () => {
    const response: ClientResponses['clearTasks'] = await client.clearTasks({
      body: { completed: true },
    });

    assert.equal(response.status, 200);
    assert.ok(response.body.every((task) => task.completed));
  });

  it('clear all of the tasks', async () => {
    await client.createTask({ body: { title: 'Task 1' } });

    await client.createTask({ body: { title: 'Task 2' } }).then(({ body }) =>
      client.updateTask({
        params: { id: body.id },
        body: { completed: true },
      }),
    );
    const response: ClientResponses['clearTasks'] = await client.clearTasks();

    assert.equal(response.status, 200);
    assert.equal(response.body.length, 2);
  });
});
