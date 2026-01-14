import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from 'react-query';
import { tasksApi } from '@/lib/api';
import { Task, CreateTaskInput, UpdateTaskInput, TaskFilters, PaginatedResponse, TaskStatus } from '@/types';

const TASKS_KEY = 'tasks';

export const useTasks = (filters?: TaskFilters, page = 1, pageSize = 20) => {
  return useQuery<PaginatedResponse<Task>, Error>(
    [TASKS_KEY, filters, page, pageSize],
    () => tasksApi.getAll(filters, page, pageSize),
    {
      staleTime: 1000 * 60 * 2,
      keepPreviousData: true,
      onError: (error) => {
        console.error('Failed to fetch tasks:', error);
      },
    }
  );
};

export const useInfiniteTasks = (filters?: TaskFilters, pageSize = 20) => {
  return useInfiniteQuery<PaginatedResponse<Task>, Error>(
    [TASKS_KEY, 'infinite', filters],
    ({ pageParam = 1 }) => tasksApi.getAll(filters, pageParam, pageSize),
    {
      getNextPageParam: (lastPage) => {
        if (lastPage.page < lastPage.totalPages) {
          return lastPage.page + 1;
        }
        return undefined;
      },
      staleTime: 1000 * 60 * 2,
    }
  );
};

export const useProjectTasks = (projectId: string | undefined) => {
  return useQuery<Task[], Error>(
    [TASKS_KEY, 'project', projectId],
    () => tasksApi.getByProject(projectId!),
    {
      enabled: !!projectId,
      staleTime: 1000 * 60 * 2,
      onError: (error) => {
        console.error(`Failed to fetch tasks for project ${projectId}:`, error);
      },
    }
  );
};

export const useTask = (id: string | undefined) => {
  return useQuery<Task, Error>(
    [TASKS_KEY, id],
    () => tasksApi.getById(id!),
    {
      enabled: !!id,
      staleTime: 1000 * 60 * 2,
      onError: (error) => {
        console.error(`Failed to fetch task ${id}:`, error);
      },
    }
  );
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, CreateTaskInput>(
    (data) => tasksApi.create(data),
    {
      onSuccess: (newTask) => {
        queryClient.invalidateQueries([TASKS_KEY]);
        queryClient.invalidateQueries(['projects', newTask.projectId]);
      },
      onError: (error) => {
        console.error('Failed to create task:', error);
      },
    }
  );
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, { id: string; data: UpdateTaskInput }>(
    ({ id, data }) => tasksApi.update(id, data),
    {
      onMutate: async ({ id, data }) => {
        await queryClient.cancelQueries([TASKS_KEY, id]);

        const previousTask = queryClient.getQueryData<Task>([TASKS_KEY, id]);

        if (previousTask) {
          queryClient.setQueryData<Task>([TASKS_KEY, id], {
            ...previousTask,
            ...data,
            updatedAt: new Date().toISOString(),
          });
        }

        return { previousTask };
      },
      onError: (error, { id }, context) => {
        console.error('Failed to update task:', error);
        if (context?.previousTask) {
          queryClient.setQueryData([TASKS_KEY, id], context.previousTask);
        }
      },
      onSettled: (updatedTask) => {
        queryClient.invalidateQueries([TASKS_KEY]);
        if (updatedTask) {
          queryClient.invalidateQueries(['projects', updatedTask.projectId]);
        }
      },
    }
  );
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, { id: string; status: TaskStatus }>(
    ({ id, status }) => tasksApi.updateStatus(id, status),
    {
      onMutate: async ({ id, status }) => {
        await queryClient.cancelQueries([TASKS_KEY, id]);

        const previousTask = queryClient.getQueryData<Task>([TASKS_KEY, id]);

        if (previousTask) {
          queryClient.setQueryData<Task>([TASKS_KEY, id], {
            ...previousTask,
            status,
            completedAt: status === 'DONE' ? new Date().toISOString() : null,
            updatedAt: new Date().toISOString(),
          });
        }

        return { previousTask };
      },
      onError: (error, { id }, context) => {
        console.error('Failed to update task status:', error);
        if (context?.previousTask) {
          queryClient.setQueryData([TASKS_KEY, id], context.previousTask);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries([TASKS_KEY]);
        queryClient.invalidateQueries(['projects']);
      },
    }
  );
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; projectId: string }>(
    ({ id }) => tasksApi.delete(id),
    {
      onSuccess: (_, { id, projectId }) => {
        queryClient.removeQueries([TASKS_KEY, id]);
        queryClient.invalidateQueries([TASKS_KEY]);
        queryClient.invalidateQueries(['projects', projectId]);
      },
      onError: (error) => {
        console.error('Failed to delete task:', error);
      },
    }
  );
};
