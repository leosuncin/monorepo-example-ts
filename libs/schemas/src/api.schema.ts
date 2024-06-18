import { z } from 'zod';

import { Task, TaskId } from './task.schema.js';

export const ErrorResponse = z.object({
  message: z.string().min(1),
  cause: z.unknown().array().optional(),
});

export const QueryTasks = z
  .object({
    after: TaskId.shape.id,
    limit: z.coerce.number().int().min(2).max(100),
    page: z.coerce.number().int().positive(),
    s: Task.shape.title,
  })
  .partial()
  .transform(({ page = 1, limit = 10, ...rest }) => ({
    offset: limit! * (page! - 1),
    limit,
    page,
    ...rest,
  }));

export const TasksPaginated = z.object({
  data: Task.array(),
  metadata: z.object({
    itemsPerPage: z.number().int().min(2).max(100),
    totalItems: z.number().int().positive(),
    itemCount: z.number().int().positive(),
    currentPage: z.number().int().min(1),
    totalPages: z.number().int().min(1),
  }),
});
