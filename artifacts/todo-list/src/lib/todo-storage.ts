import { z } from "zod";
import type { Todo } from "./todos";

export const TODO_STORAGE_KEY = "todo-list.todos.v1";

export interface TodoStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const todoListSchema = z.array(
  z
    .object({
      id: z.string().min(1),
      title: z.string().min(1).max(200),
      completed: z.boolean(),
      createdAt: z.string().datetime(),
      completedAt: z.string().datetime().nullable(),
    })
    .strict(),
);

export function loadTodos(storage: TodoStorage): Todo[] {
  let serialized: string | null;
  try {
    serialized = storage.getItem(TODO_STORAGE_KEY);
  } catch (error) {
    throw new Error("Saved todos could not be read from browser storage.", {
      cause: error,
    });
  }

  if (serialized === null) {
    return [];
  }

  let data: unknown;
  try {
    data = JSON.parse(serialized);
  } catch (error) {
    throw new Error("Saved todos contain invalid JSON.", { cause: error });
  }

  const result = todoListSchema.safeParse(data);
  if (!result.success) {
    throw new Error("Saved todos have an invalid format.", {
      cause: result.error,
    });
  }
  return result.data;
}

export function saveTodos(todos: Todo[], storage: TodoStorage): void {
  const result = todoListSchema.safeParse(todos);
  if (!result.success) {
    throw new Error("Todos could not be saved because their data is invalid.", {
      cause: result.error,
    });
  }

  try {
    storage.setItem(TODO_STORAGE_KEY, JSON.stringify(result.data));
  } catch (error) {
    throw new Error("Todos could not be saved to browser storage.", {
      cause: error,
    });
  }
}
