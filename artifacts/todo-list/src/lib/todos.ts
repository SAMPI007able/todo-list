export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
}

export type TodoFilter = "all" | "active" | "completed";

export interface CreateTodoOptions {
  id?: string;
  now?: Date;
}

export function createTodo(
  title: string,
  options: CreateTodoOptions = {},
): Todo {
  const normalizedTitle = title.trim();
  if (!normalizedTitle) {
    throw new Error("A todo needs a title.");
  }
  if (normalizedTitle.length > 200) {
    throw new Error("Todo titles must be 200 characters or fewer.");
  }

  return {
    id: options.id ?? globalThis.crypto.randomUUID(),
    title: normalizedTitle,
    completed: false,
    createdAt: (options.now ?? new Date()).toISOString(),
    completedAt: null,
  };
}

export function toggleTodo(
  todos: readonly Todo[],
  id: string,
  now: Date = new Date(),
): Todo[] {
  const todo = todos.find((item) => item.id === id);
  if (!todo) {
    throw new Error(`Todo "${id}" was not found.`);
  }

  return todos.map((item) =>
    item.id === id
      ? {
          ...item,
          completed: !item.completed,
          completedAt: item.completed ? null : now.toISOString(),
        }
      : item,
  );
}

export function removeTodo(todos: readonly Todo[], id: string): Todo[] {
  if (!todos.some((todo) => todo.id === id)) {
    throw new Error(`Todo "${id}" was not found.`);
  }
  return todos.filter((todo) => todo.id !== id);
}

export function filterTodos(
  todos: readonly Todo[],
  filter: TodoFilter,
): Todo[] {
  switch (filter) {
    case "all":
      return [...todos];
    case "active":
      return todos.filter((todo) => !todo.completed);
    case "completed":
      return todos.filter((todo) => todo.completed);
  }
}

export function getTodoCounts(todos: readonly Todo[]) {
  const completed = todos.filter((todo) => todo.completed).length;
  return {
    total: todos.length,
    active: todos.length - completed,
    completed,
  };
}
