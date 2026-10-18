import { describe, expect, it } from "vitest";
import {
  createTodo,
  filterTodos,
  getTodoCounts,
  removeTodo,
  toggleTodo,
} from "./todos";

describe("todo functions", () => {
  it("trims titles and creates a new active todo", () => {
    expect(
      createTodo("  Plan the week  ", {
        id: "todo-1",
        now: new Date("2026-10-18T10:00:00.000Z"),
      }),
    ).toEqual({
      id: "todo-1",
      title: "Plan the week",
      completed: false,
      createdAt: "2026-10-18T10:00:00.000Z",
      completedAt: null,
    });
  });

  it("rejects empty and overly long titles", () => {
    expect(() => createTodo(" \n ")).toThrow(/needs a title/);
    expect(() => createTodo("a".repeat(201))).toThrow(/200 characters/);
  });

  it("toggles completion and records or clears its timestamp", () => {
    const todo = createTodo("Send the proposal", { id: "todo-1" });
    const completed = toggleTodo(
      [todo],
      todo.id,
      new Date("2026-10-18T11:00:00.000Z"),
    );

    expect(completed[0]).toMatchObject({
      completed: true,
      completedAt: "2026-10-18T11:00:00.000Z",
    });
    expect(todo.completed).toBe(false);
    expect(toggleTodo(completed, todo.id)[0]).toMatchObject({
      completed: false,
      completedAt: null,
    });
  });

  it("filters todos and calculates the active and completed counts", () => {
    const active = createTodo("Read", { id: "active" });
    const completed = { ...createTodo("Write", { id: "done" }), completed: true };

    expect(filterTodos([active, completed], "active")).toEqual([active]);
    expect(filterTodos([active, completed], "completed")).toEqual([completed]);
    expect(getTodoCounts([active, completed])).toEqual({
      total: 2,
      active: 1,
      completed: 1,
    });
  });

  it("removes a todo and reports IDs that do not exist", () => {
    const todo = createTodo("Walk the dog", { id: "todo-1" });
    expect(removeTodo([todo], todo.id)).toEqual([]);
    expect(() => removeTodo([todo], "missing")).toThrow(/was not found/);
  });
});
