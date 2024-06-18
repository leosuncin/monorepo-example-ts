import { z } from 'zod';

export const Task = z.object({
  id: z.string().startsWith('task_'),
  title: z.string().min(1).max(255),
  completed: z.boolean().default(false),
});

export const NewTask = Task.pick({ title: true });

export const ModifyTask = z.union([
  Task.pick({ title: true }),
  Task.pick({ completed: true }),
]);

export const ToggleTask = Task.pick({ completed: true });

export const TaskId = Task.pick({ id: true });
