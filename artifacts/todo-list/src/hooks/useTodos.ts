import { useMemo, useState } from "react";
import { filterTodos, getTodoCounts, createTodo, removeTodo, toggleTodo, type Todo, type TodoFilter } from "@/lib/todos";
import { loadTodos, saveTodos } from "@/lib/todo-storage";

interface TodoState {
  todos: Todo[];
  persistenceError: string | null;
}

function getInitialState(): TodoState {
  try {
    return { todos: loadTodos(window.localStorage), persistenceError: null };
  } catch (error) {
    return {
      todos: [],
      persistenceError:
        error instanceof Error ? error.message : "Browser storage is unavailable.",
    };
  }
}

export function useTodos() {
  const [state, setState] = useState<TodoState>(getInitialState);
  const [filter, setFilter] = useState<TodoFilter>("all");
  const counts = useMemo(() => getTodoCounts(state.todos), [state.todos]);
  const visibleTodos = useMemo(
    () => filterTodos(state.todos, filter),
    [state.todos, filter],
  );

  function commit(nextTodos: Todo[]): void {
    if (state.persistenceError) {
      return;
    }
    try {
      saveTodos(nextTodos, window.localStorage);
      setState({ todos: nextTodos, persistenceError: null });
    } catch (error) {
      setState((current) => ({
        ...current,
        persistenceError:
          error instanceof Error ? error.message : "Browser storage is unavailable.",
      }));
    }
  }

  function add(title: string): void {
    commit([...state.todos, createTodo(title)]);
  }

  function toggle(id: string): void {
    commit(toggleTodo(state.todos, id));
  }

  function remove(id: string): void {
    commit(removeTodo(state.todos, id));
  }

  return {
    todos: state.todos,
    visibleTodos,
    filter,
    setFilter,
    counts,
    persistenceError: state.persistenceError,
    add,
    toggle,
    remove,
  };
}
