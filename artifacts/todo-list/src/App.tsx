import { type FormEvent, type ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Check, CornerDownLeft, Plus, X } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useTodos } from '@/hooks/useTodos';
import type { TodoFilter } from '@/lib/todos';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

const filterLabels: { key: TodoFilter; label: string }[] = [
  { key: 'all', label: 'Everything' },
  { key: 'active', label: 'To do' },
  { key: 'completed', label: 'Done' },
];

function Home() {
  const { visibleTodos, filter, setFilter, counts, persistenceError, add, toggle, remove } =
    useTodos();
  const [title, setTitle] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const progress = counts.total ? Math.round((counts.completed / counts.total) * 100) : 0;
  const today = new Intl.DateTimeFormat('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  function submitTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setFormMessage('Add a few words before saving.');
      return;
    }
    if (cleanTitle.length > 200) {
      setFormMessage('Keep it to 200 characters or fewer.');
      return;
    }
    setFormMessage('');
    add(cleanTitle);
    setTitle('');
  }

  return (
    <main className="page-shell">
      <div className="ambient-orb ambient-orb-one" aria-hidden="true" />
      <div className="ambient-orb ambient-orb-two" aria-hidden="true" />

      <div className="todo-wrap">
        <header className="masthead">
          <div className="brand-lockup" aria-label="Daymark">
            <span className="brand-symbol" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span>daymark</span>
          </div>
          <div className="date-label">{today}</div>
        </header>

        <section className="intro" aria-labelledby="page-title">
          <div className="intro-kicker"><span className="kicker-line" /> YOUR DAY, IN GOOD HANDS</div>
          <h1 id="page-title">Make room for<br /><em>what matters.</em></h1>
          <p className="intro-copy">A little place to gather the things you want to get to.</p>
        </section>

        {persistenceError && (
          <div className="storage-alert" role="alert" data-testid="status-persistence-error">
            <span className="alert-mark" aria-hidden="true">!</span>
            <div>
              <strong>Your list isn’t being saved.</strong>
              <p>{persistenceError} Your current tasks are still visible, but changes are paused.</p>
            </div>
          </div>
        )}

        <form className="add-form" onSubmit={submitTodo} aria-label="Add a task">
          <label htmlFor="new-todo" className="sr-only">What would you like to remember?</label>
          <div className="input-wrap">
            <Plus size={19} strokeWidth={1.8} aria-hidden="true" />
            <input
              id="new-todo"
              data-testid="input-new-todo"
              type="text"
              maxLength={200}
              placeholder="What would you like to remember?"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (formMessage) setFormMessage('');
              }}
              disabled={Boolean(persistenceError)}
            />
            <span className="input-shortcut" aria-hidden="true"><CornerDownLeft size={13} /></span>
            <button
              className="add-button"
              type="submit"
              aria-label="Add task"
              data-testid="button-add-todo"
              disabled={Boolean(persistenceError) || !title.trim()}
            >
              Add <span aria-hidden="true">+</span>
            </button>
          </div>
          {formMessage && <p className="form-message" role="alert">{formMessage}</p>}
        </form>

        <section className="list-panel" aria-label="Your tasks">
          <div className="list-topline">
            <div className="list-heading">
              <h2>Your list</h2>
              <span className="total-count" data-testid="text-total-count">{counts.total}</span>
            </div>
            <div className="filter-tabs" role="group" aria-label="Filter tasks">
              {filterLabels.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  className={`filter-tab${filter === key ? ' is-selected' : ''}`}
                  onClick={() => setFilter(key)}
                  aria-pressed={filter === key}
                  data-testid={`button-filter-${key}`}
                >
                  {label}
                  <span className="filter-count">
                    {key === 'all' ? counts.total : key === 'active' ? counts.active : counts.completed}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {counts.total > 0 && (
            <div className="progress-row" aria-label={`${counts.completed} of ${counts.total} tasks complete`}>
              <div className="progress-track" aria-hidden="true">
                <span className="progress-fill" style={{ transform: `scaleX(${progress / 100})` }} />
              </div>
              <span className="progress-caption" data-testid="text-progress">
                {counts.completed} of {counts.total} complete
              </span>
            </div>
          )}

          {visibleTodos.length > 0 ? (
            <ul className="todo-list" data-testid="list-todos">
              {visibleTodos.map((todo) => (
                <li className={`todo-item${todo.completed ? ' is-complete' : ''}`} key={todo.id} data-testid={`item-todo-${todo.id}`}>
                  <button
                    type="button"
                    className="check-button"
                    onClick={() => toggle(todo.id)}
                    aria-label={todo.completed ? `Mark ${todo.title} as not done` : `Complete ${todo.title}`}
                    aria-pressed={todo.completed}
                    data-testid={`button-toggle-${todo.id}`}
                    disabled={Boolean(persistenceError)}
                  >
                    <span className="check-inner">{todo.completed && <Check size={14} strokeWidth={2.6} />}</span>
                  </button>
                  <span className="todo-title" data-testid={`text-todo-${todo.id}`}>{todo.title}</span>
                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => remove(todo.id)}
                    aria-label={`Remove ${todo.title}`}
                    data-testid={`button-remove-${todo.id}`}
                    disabled={Boolean(persistenceError)}
                  >
                    <X size={17} strokeWidth={1.8} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state" data-testid="status-empty">
              <div className="empty-mark" aria-hidden="true">
                {counts.total === 0 ? <span className="empty-sun" /> : <Check size={19} strokeWidth={1.8} />}
              </div>
              {counts.total === 0 ? (
                <>
                  <h3>A fresh page.</h3>
                  <p>When something comes to mind, leave it here.</p>
                </>
              ) : filter === 'active' ? (
                <>
                  <h3>All caught up.</h3>
                  <p>You’ve made space for the next thing.</p>
                </>
              ) : (
                <>
                  <h3>Nothing checked off just yet.</h3>
                  <p>Every finished thing starts somewhere.</p>
                </>
              )}
            </div>
          )}
        </section>

        <footer className="page-footer">
          <span className="footer-dot" aria-hidden="true" />
          <span>{counts.active === 0 && counts.total > 0 ? 'Look at you, all done.' : 'One thing at a time is plenty.'}</span>
          <span className="footer-counts" data-testid="text-task-totals">
            {counts.active} left <span aria-hidden="true">·</span> {counts.completed} done
          </span>
        </footer>
      </div>
    </main>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
