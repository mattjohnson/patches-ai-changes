import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useProjects, useProject, useCreateProject, useDeleteProject } from '@/hooks/useProjects';

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

describe('useProjects', () => {
  it('fetches projects successfully', async () => {
    const wrapper = createWrapper();

    const { result, waitFor: hookWaitFor } = renderHook(() => useProjects(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await hookWaitFor(() => result.current.isSuccess);

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });

  it('fetches archived projects when specified', async () => {
    const wrapper = createWrapper();

    const { result, waitFor: hookWaitFor } = renderHook(
      () => useProjects({ archived: true }),
      { wrapper }
    );

    await hookWaitFor(() => !result.current.isLoading);

    expect(result.current.data).toBeDefined();
  });

  it('handles fetch errors gracefully', async () => {
    const wrapper = createWrapper();

    const { result, waitFor: hookWaitFor } = renderHook(() => useProjects(), { wrapper });

    await hookWaitFor(() => !result.current.isLoading);

    expect(result.current.error).toBe(null);
  });
});

describe('useProject', () => {
  it('fetches a single project by id', async () => {
    const wrapper = createWrapper();

    const { result, waitFor: hookWaitFor } = renderHook(
      () => useProject('project-1'),
      { wrapper }
    );

    await hookWaitFor(() => !result.current.isLoading);

    if (result.current.data) {
      expect(result.current.data.id).toBe('project-1');
    }
  });

  it('does not fetch when id is undefined', () => {
    const wrapper = createWrapper();

    const { result } = renderHook(() => useProject(undefined), { wrapper });

    expect(result.current.isIdle).toBe(true);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useCreateProject', () => {
  it('provides mutation function', () => {
    const wrapper = createWrapper();

    const { result } = renderHook(() => useCreateProject(), { wrapper });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });

  it('tracks loading state during mutation', async () => {
    const wrapper = createWrapper();

    const { result } = renderHook(() => useCreateProject(), { wrapper });

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.mutate({
        name: 'New Project',
        description: 'Test description',
        color: '#6366f1',
      });
    });

    expect(result.current.isLoading).toBe(true);
  });
});

describe('useDeleteProject', () => {
  it('provides mutation function', () => {
    const wrapper = createWrapper();

    const { result } = renderHook(() => useDeleteProject(), { wrapper });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });

  it('is not loading initially', () => {
    const wrapper = createWrapper();

    const { result } = renderHook(() => useDeleteProject(), { wrapper });

    expect(result.current.isLoading).toBe(false);
  });
});
