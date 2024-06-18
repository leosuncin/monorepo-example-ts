import { contract } from '@monorepo/contract';
import { TaskService } from '@monorepo/data-access';
import { initServer } from '@ts-rest/express';

import { database } from './database.js';

const taskService = new TaskService(database);

export const router = initServer().router(contract, {
  async createTask({ body }) {
    const task = await taskService.createTask(body);

    return {
      body: task,
      status: 201,
    };
  },
  async listTasks({ query }) {
    const [tasks, count] = await taskService.listTask(query);

    if (tasks.length === 0) {
      return {
        body: undefined,
        status: 204,
      };
    }

    return {
      body: {
        data: tasks,
        metadata: {
          currentPage: Number(query.page),
          itemCount: tasks.length,
          itemsPerPage: Number(query.limit),
          totalItems: count,
          totalPages: Math.max(Math.ceil(count / Number(query.limit)), 1),
        },
      },
      status: 200,
    };
  },
  async toggleTasks({ body }) {
    const tasks = await taskService.toggleTasks(body);

    if (tasks.length === 0) {
      return {
        status: 204,
        body: undefined,
      };
    }

    return {
      body: tasks,
      status: 200,
    };
  },
  async clearTasks({ body }) {
    const tasks = await taskService.clearTasks(body.completed);

    if (tasks.length === 0) {
      return {
        body: undefined,
        status: 204,
      };
    }

    return {
      body: tasks,
      status: 200,
    };
  },
  async getTask({ params }) {
    // @ts-expect-error id is already validated
    const task = await taskService.getTask(params.id);

    if (!task) {
      return {
        status: 404,
        body: {
          message: 'Task not found',
        },
      };
    }

    return {
      body: task,
      status: 200,
    };
  },
  async updateTask({ body, params }) {
    // @ts-expect-error id is already validated
    const task = await taskService.updateTask(params.id, body);

    if (!task) {
      return {
        status: 404,
        body: {
          message: 'Task not found',
        },
      };
    }

    return {
      body: task,
      status: 200,
    };
  },
  async removeTask({ params }) {
    // @ts-expect-error id is already validated
    const task = await taskService.removeTask(params.id);

    if (!task) {
      return {
        status: 404,
        body: {
          message: 'Task not found',
        },
      };
    }

    return {
      body: undefined,
      status: 204,
    };
  },
});
