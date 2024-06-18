import {
  ErrorResponse,
  ModifyTask,
  NewTask,
  QueryTasks,
  Task,
  TaskId,
  TasksPaginated,
  ToggleTask,
} from '@monorepo/schemas';
import {
  initContract,
  ClientInferResponses,
  ClientInferResponseBody,
  ServerInferRequest,
} from '@ts-rest/core';
import { z } from 'zod';

const { router } = initContract();

export const contract = router(
  {
    createTask: {
      path: '/tasks',
      method: 'POST',
      body: NewTask,
      responses: {
        201: Task,
      },
      summary: 'Create a new task',
      description: 'Add a new task to the list',
    },
    listTasks: {
      path: '/tasks',
      method: 'GET',
      query: QueryTasks,
      responses: {
        200: TasksPaginated,
        204: z.void(),
      },
      summary: 'List the tasks',
      description: 'List, search and paginate all of the tasks',
    },
    toggleTasks: {
      path: '/tasks',
      method: 'PUT',
      body: ToggleTask,
      responses: {
        200: Task.array(),
        204: z.void(),
      },
      summary: 'Toggle tasks',
      description: 'Toggle the completed state of all the tasks',
    },
    clearTasks: {
      path: '/tasks',
      method: 'DELETE',
      body: ToggleTask.partial(),
      responses: {
        200: Task.array(),
        204: z.void(),
      },
      summary: 'Clear tasks',
      description: 'Remove completed tasks or all the tasks',
    },
    getTask: {
      path: '/tasks/:id',
      method: 'GET',
      pathParams: TaskId,
      responses: {
        200: Task,
        404: ErrorResponse,
      },
      summary: 'Get a task',
      description: 'Get one task by its id',
    },
    updateTask: {
      path: '/tasks/:id',
      method: 'PATCH',
      pathParams: TaskId,
      body: ModifyTask,
      responses: {
        200: Task,
        404: ErrorResponse,
      },
      summary: 'Update a task',
      description: 'Modify one task by its id',
    },
    removeTask: {
      path: '/tasks/:id',
      method: 'DELETE',
      pathParams: TaskId,
      body: z.unknown().optional(),
      responses: {
        204: z.void(),
        404: ErrorResponse,
      },
      summary: 'Remove a task',
      description: 'Remove one task by its id',
    },
  },
  { strictStatusCodes: true },
);

export type ClientResponses = ClientInferResponses<typeof contract>;

export type Task = ClientInferResponseBody<typeof contract.getTask, 200>;

export type ServerRequests<Route extends keyof typeof contract> =
  'body' extends keyof ServerInferRequest<typeof contract>[Route]
    ? ServerInferRequest<typeof contract>[Route]['body']
    : never;
