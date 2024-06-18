import { useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { forwardRef } from 'react';

import { client } from '../client';

function pluralize(count: number) {
  return count === 1 ? ' item' : ' items';
}

export type FilterTask = 'all' | 'active' | 'completed';

type FilterTasksProps = {
  activeCount: number;
  completedCount: number;
  filter: FilterTask;
  onChangeFilter: (filter: FilterTask) => void;
};

const FilterTasks = forwardRef<HTMLElement, FilterTasksProps>(
  ({ activeCount, completedCount, filter, onChangeFilter }, ref) => {
    const queryClient = useQueryClient();
    const { mutate } = client.clearTasks.useMutation({
      onSuccess() {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      },
    });
    function switchFilter(filter: FilterTask) {
      return (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        onChangeFilter(filter);
      };
    }
    function clearCompleted() {
      mutate({ body: { completed: true } });
    }

    return (
      <footer className="footer" ref={ref}>
        <span className="todo-count">
          <strong>{activeCount}</strong>
          {pluralize(activeCount)} left
        </span>
        <ul className="filters">
          <li>
            <a
              href="#/"
              className={clsx({ selected: filter === 'all' })}
              onClick={switchFilter('all')}
            >
              All
            </a>
          </li>
          &nbsp;
          <li>
            <a
              href="#/active"
              className={clsx({ selected: filter === 'active' })}
              onClick={switchFilter('active')}
            >
              Active
            </a>
          </li>
          &nbsp;
          <li>
            <a
              href="#/completed"
              className={clsx({ selected: filter === 'completed' })}
              onClick={switchFilter('completed')}
            >
              Completed
            </a>
          </li>
        </ul>
        {completedCount > 0 ? (
          <button
            type="button"
            className="clear-completed"
            onClick={clearCompleted}
          >
            Clear completed
          </button>
        ) : undefined}
      </footer>
    );
  },
);

export default FilterTasks;
