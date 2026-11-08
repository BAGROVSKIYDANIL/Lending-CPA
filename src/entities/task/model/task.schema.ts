import { z } from 'zod';

export const taskTileSchema = z.object({
  title: z.string().min(1),
  text: z.string().min(1),
});

export const tasksResponseSchema = z.object({
  description: z.string().min(1),
  tiles: z.array(taskTileSchema).min(1),
});

export type TaskTile = z.infer<typeof taskTileSchema>;
export type TasksResponse = z.infer<typeof tasksResponseSchema>;
