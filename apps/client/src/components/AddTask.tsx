import { useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

import { client } from '../client';

function AddTask() {
  const queryClient = useQueryClient();
  const { mutate, isPending } = client.createTask.useMutation({
    onMutate() {
      formRef.current?.setAttribute('disabled', 'disabled');
    },
    onSuccess() {
      formRef.current?.removeAttribute('disabled');
      formRef.current?.reset();
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError() {
      formRef.current?.removeAttribute('disabled');
    },
  });
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isPending) return;

    const title = event.currentTarget.elements.namedItem(
      'title',
    ) as HTMLInputElement;

    mutate({ body: { title: title.value } });
  }

  return (
    <header className="header">
      <h1>todos</h1>
      <form onSubmit={handleSubmit} ref={formRef}>
        <input
          name="title"
          type="text"
          required
          className="new-todo"
          placeholder="What needs to be done?"
          aria-label="Add a new todo"
        />
      </form>
    </header>
  );
}

export default AddTask;
