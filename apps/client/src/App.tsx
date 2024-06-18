import type { ClientResponses } from '@monorepo/contract';
import type { InfiniteData } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';

import { client } from './client';
import AddTask from './components/AddTask';
import FilterTasks, { type FilterTask } from './components/FilterTasks';
import ListTasks from './components/ListTasks';

function hasPages(
  data: unknown,
): data is InfiniteData<ClientResponses['listTasks'], number> {
  return typeof data === 'object' && data !== null && 'pages' in data;
}

function App() {
  const loadMoreRef = useRef<HTMLElement | null>(null);
  const page = useRef(1);
  const [filter, setFilter] = useState<FilterTask>('all');
  const { data, isLoading, isError, fetchNextPage } =
    client.listTasks.useInfiniteQuery(
      ['tasks', page.current],
      ({ pageParam }) => ({ query: { page: Number(pageParam), limit: 20 } }),
      {
        getNextPageParam(lastPage) {
          if (lastPage.status !== 200) return undefined;
          page.current = lastPage.body.metadata.currentPage;

          return lastPage.body.metadata.currentPage + 1;
        },
        initialPageParam: 1,
        queryKey: ['tasks'],
      },
    );
  const tasks = useMemo(() => {
    if (hasPages(data)) {
      return data.pages.flatMap((page) =>
        page.status === 200 ? page.body.data : [],
      );
    }
    return [];
  }, [data]);
  const activeCount = useMemo(() => {
    return tasks.reduce(
      (count, task) => (task.completed ? count : count + 1),
      0,
    );
  }, [tasks]);
  const filteredTasks = tasks.filter((task) =>
    filter === 'active'
      ? !task.completed
      : filter === 'completed'
        ? task.completed
        : true,
  );
  const completedCount = useMemo(
    () => tasks.length - activeCount,
    [tasks, activeCount],
  );

  useEffect(() => {
    const loadMore = loadMoreRef.current;
    const observer = new IntersectionObserver(
      () => {
        fetchNextPage();
      },
      {
        rootMargin: '0px',
        threshold: 1,
      },
    );

    if (loadMore) {
      observer.observe(loadMore);
    }

    return () => {
      if (loadMore) {
        observer.unobserve(loadMore);
      }

      observer.disconnect();
    };
  }, [loadMoreRef, fetchNextPage]);

  return (
    <div className="todoapp">
      <AddTask />

      <ListTasks
        tasks={filteredTasks}
        activeCount={activeCount}
        isLoading={isLoading}
        isError={isError}
      />

      <FilterTasks
        ref={loadMoreRef}
        activeCount={activeCount}
        completedCount={completedCount}
        filter={filter}
        onChangeFilter={setFilter}
      />
    </div>
  );
}

export default App;
