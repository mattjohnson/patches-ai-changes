import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  useTasks,
  useTask,
  useProjectTasks,
  useCreateTask,
  useUpdateTask,
  useUpdateTaskStatus,
  useDeleteTask,
} from '@/hooks/useTasks';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useTasks', () => {
  it('fetches tasks with pagination', async () => {
    const wrapper = createWrapper();

    const { result, waitFor } = renderHook(() => useTasks({}, 1, 10), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => !result.current.isLoading);

    if (result.current.data) {
      expect(result.current.data).toHaveProperty('data');
      expect(result.current.data).toHaveProperty('total');
      expect(result.current.data).toHaveProperty('page');
      expect(result.current.data).toHaveProperty('pageSize');
      expect(result.current.data).toHaveProperty('totalPages');
    }
  });

  it('fetches tasks with status filter', async () => {
    const wrapper = createWrapper();

    const { result, waitFor } = renderHook(
      () => useTasks({ status: 'TODO' }, 1, 10),
      { wrapper }
    );

    await waitFor(() => !result.current.isLoading);

    expect(result.current.data).toBeDefined();
  });

  it('fetches tasks with priority filter', async () => {
    const wrapper = createWrapper();

    const { result, waitFor } = renderHook(
      () => useTasks({ priority: 'HIGH' }, 1, 10),
      { wrapper }
    );

    await waitFor(() => !result.current.isLoading);

    expect(result.current.data).toBeDefined();
  });

  it('keeps previous data when changing pages', async () => {
    const wrapper = createWrapper();

    const { result, waitFor, rerender } = renderHook(
      ({ page }) => useTasks({}, page, 10),
      { wrapper, initialProps: { page: 1 } }
    );

    await waitFor(() => !result.current.isLoading);

    const firstPageData = result.current.data;

    rerender({ page: 2 });

    expect(result.current.isPreviousData || result.current.data === firstPageData).toBe(true);
  });
});

describe('useTask', () => {
  it('fetches a single task by id', async () => {
    const wrapper = createWrapper();

    const { result, waitFor } = renderHook(() => useTask('task-1'), { wrapper });

    await waitFor(() => !result.current.isLoading);

    if (result.current.data) {
      expect(result.current.data.id).toBe('task-1');
    }
  });

  it('does not fetch when id is undefined', () => {
    const wrapper = createWrapper();

    const { result } = renderHook(() => useTask(undefined), { wrapper });

    expect(result.current.isIdle).toBe(true);
  });
});

describe('useProjectTasks', () => {
  it('fetches tasks for a specific project', async () => {
    const wrapper = createWrapper();

    const { result, waitFor } = renderHook(
      () => useProjectTasks('project-1'),
      { wrapper }
    );

    await waitFor(() => !result.current.isLoading);

    expect(result.current.data).toBeDefined();
  });

  it('does not fetch when projectId is undefined', () => {
    const wrapper = createWrapper();

    const { result } = renderHook(() => useProjectTasks(undefined), { wrapper });

    expect(result.current.isIdle).toBe(true);
  });
});

describe('useCreateTask', () => {
  it('provides mutation function', () => {
    const wrapper = createWrapper();

    const { result } = renderHook(() => useCreateTask(), { wrapper });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });

  it('completes mutation successfully', async () => {
    const wrapper = createWrapper();

    const { result, waitForNextUpdate } = renderHook(() => useCreateTask(), { wrapper });

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.mutate({
        title: 'New Task',
        projectId: 'project-1',
      });
    });

    await waitForNextUpdate();
    expect(result.current.isSuccess).toBe(true);
  });
});

describe('useUpdateTask', () => {
  it('provides mutation function', () => {
    const wrapper = createWrapper();

    const { result } = renderHook(() => useUpdateTask(), { wrapper });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });
});

describe('useUpdateTaskStatus', () => {
  it('provides mutation function', () => {
    const wrapper = createWrapper();

    const { result } = renderHook(() => useUpdateTaskStatus(), { wrapper });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });

  it('completes mutation successfully', async () => {
    const wrapper = createWrapper();

    const { result, waitForNextUpdate } = renderHook(() => useUpdateTaskStatus(), { wrapper });

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.mutate({ id: 'task-1', status: 'DONE' });
    });

    await waitForNextUpdate();
    expect(result.current.isSuccess).toBe(true);
  });
});

describe('useDeleteTask', () => {
  it('provides mutation function', () => {
    const wrapper = createWrapper();

    const { result } = renderHook(() => useDeleteTask(), { wrapper });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });

  it('is not loading initially', () => {
    const wrapper = createWrapper();

    const { result } = renderHook(() => useDeleteTask(), { wrapper });

    expect(result.current.isLoading).toBe(false);
  });
});
