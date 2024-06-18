import type { Task } from '@monorepo/contract';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { client } from '../client';
import TaskItem from './TaskItem';

type ListTasksProps = {
  tasks: Task[];
  isLoading: boolean;
  isError: boolean;
  activeCount: number;
};

function ListTasks({ tasks, isError, isLoading, activeCount }: ListTasksProps) {
  const [currentEditing, setCurrentEditing] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { mutate: toggleAll } = client.toggleTasks.useMutation({
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  function handleToggleAll(event: React.ChangeEvent<HTMLInputElement>) {
    toggleAll({ body: { completed: event.currentTarget.checked } });
  }

  if (isLoading) {
    return (
      <div className="todo-list">
        <div className="view">Loading...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="todo-list">
        <div className="view">ERROR!</div>
      </div>
    );
  }

  return (
    <section className="main">
      <input
        id="toggle-all"
        className="toggle-all"
        type="checkbox"
        aria-label="Toggle all"
        checked={activeCount === 0}
        onChange={handleToggleAll}
      />

      <label htmlFor="toggle-all" aria-label="Toggle all"></label>

      <ul className="todo-list">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            {...task}
            editing={task.id === currentEditing}
            onEdit={() => setCurrentEditing(task.id)}
            onCancelEdit={() => setCurrentEditing(null)}
          />
        ))}
      </ul>
    </section>
  );
}

export default ListTasks;
