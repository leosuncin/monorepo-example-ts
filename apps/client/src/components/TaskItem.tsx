import type { Task } from '@monorepo/contract';
import { useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';

import { client } from '../client';

type TaskItemProps = Task & {
  editing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
};

function TaskItem({
  completed,
  id,
  title,
  editing,
  onEdit,
  onCancelEdit,
}: TaskItemProps) {
  const queryClient = useQueryClient();
  const { mutate: update } = client.updateTask.useMutation({
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
  const { mutate: remove } = client.removeTask.useMutation({
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  function handleToggleTask() {
    update({ body: { completed: !completed }, params: { id } });
  }

  function handleRemoveTask() {
    remove({ params: { id }, body: undefined });
  }

  function handleEdit(
    event:
      | React.KeyboardEvent<HTMLInputElement>
      | React.FocusEvent<HTMLInputElement>,
  ) {
    if ('code' in event && event.code === 'Escape') {
      onCancelEdit();
    }

    if ('code' in event && event.code !== 'Enter') {
      return;
    }

    update(
      { body: { title: event.currentTarget.value }, params: { id } },
      {
        onSettled() {
          onCancelEdit();
        },
      },
    );
  }

  return (
    <li className={clsx({ completed: completed, editing })}>
      <div className="view">
        <input
          className="toggle"
          type="checkbox"
          aria-label={`Toggle ${title}`}
          checked={completed}
          onChange={handleToggleTask}
        />
        <label onDoubleClick={onEdit}>{title}</label>
        <button
          type="button"
          className="destroy"
          onClick={handleRemoveTask}
          aria-label={`Remove ${title}`}
        ></button>
      </div>
      {editing ? (
        <input
          className="edit"
          aria-label={`Edit ${title}`}
          defaultValue={title}
          onKeyUp={handleEdit}
          onBlur={handleEdit}
        />
      ) : undefined}
    </li>
  );
}

export default TaskItem;
