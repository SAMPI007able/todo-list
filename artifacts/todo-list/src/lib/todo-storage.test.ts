import { describe, expect, it } from "vitest";
import {
  loadTodos,
  saveTodos,
  TODO_STORAGE_KEY,
  type TodoStorage,
} from "./todo-storage";
import { createTodo } from "./todos";

class MemoryStorage implements TodoStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  put(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe("todo browser storage", () => {
  it("loads an empty list when no todos have been saved", () => {
    expect(loadTodos(new MemoryStorage())).toEqual([]);
  });

  it("saves and reloads todos", () => {
    const storage = new MemoryStorage();
    const todos = [createTodo("Review notes", { id: "todo-1" })];

    saveTodos(todos, storage);

    expect(storage.getItem(TODO_STORAGE_KEY)).toContain('"Review notes"');
    expect(loadTodos(storage)).toEqual(todos);
  });

  it("fails explicitly for invalid saved data", () => {
    const storage = new MemoryStorage();
    storage.put(TODO_STORAGE_KEY, "{not-json");

    expect(() => loadTodos(storage)).toThrow(/invalid JSON/);

    storage.put(TODO_STORAGE_KEY, JSON.stringify([{ title: "missing fields" }]));
    expect(() => loadTodos(storage)).toThrow(/invalid format/);
  });
});
