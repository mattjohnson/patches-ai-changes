import { useQuery, useMutation, useQueryClient } from 'react-query';
import { projectsApi } from '@/lib/api';
import { Project, CreateProjectInput, UpdateProjectInput } from '@/types';

const PROJECTS_KEY = 'projects';

export const useProjects = (params?: { archived?: boolean }) => {
  return useQuery<Project[], Error>(
    [PROJECTS_KEY, params],
    () => projectsApi.getAll(params),
    {
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 30,
      refetchOnWindowFocus: true,
      retry: 2,
      onError: (error) => {
        console.error('Failed to fetch projects:', error);
      },
    }
  );
};

export const useProject = (id: string | undefined) => {
  return useQuery<Project, Error>(
    [PROJECTS_KEY, id],
    () => projectsApi.getById(id!),
    {
      enabled: !!id,
      staleTime: 1000 * 60 * 5,
      onError: (error) => {
        console.error(`Failed to fetch project ${id}:`, error);
      },
    }
  );
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation<Project, Error, CreateProjectInput>(
    (data) => projectsApi.create(data),
    {
      onSuccess: (newProject) => {
        queryClient.setQueryData<Project[]>(
          [PROJECTS_KEY, { archived: false }],
          (old = []) => [newProject, ...old]
        );
        queryClient.invalidateQueries([PROJECTS_KEY]);
      },
      onError: (error) => {
        console.error('Failed to create project:', error);
      },
    }
  );
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation<Project, Error, { id: string; data: UpdateProjectInput }>(
    ({ id, data }) => projectsApi.update(id, data),
    {
      onSuccess: (updatedProject) => {
        queryClient.setQueryData<Project>(
          [PROJECTS_KEY, updatedProject.id],
          updatedProject
        );
        queryClient.invalidateQueries([PROJECTS_KEY]);
      },
      onError: (error) => {
        console.error('Failed to update project:', error);
      },
    }
  );
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>(
    (id) => projectsApi.delete(id),
    {
      onSuccess: (_, deletedId) => {
        queryClient.setQueryData<Project[]>(
          [PROJECTS_KEY, { archived: false }],
          (old = []) => old.filter((p) => p.id !== deletedId)
        );
        queryClient.removeQueries([PROJECTS_KEY, deletedId]);
        queryClient.invalidateQueries([PROJECTS_KEY]);
      },
      onError: (error) => {
        console.error('Failed to delete project:', error);
      },
    }
  );
};

export const useArchiveProject = () => {
  const queryClient = useQueryClient();

  return useMutation<Project, Error, string>(
    (id) => projectsApi.archive(id),
    {
      onSuccess: (updatedProject) => {
        queryClient.setQueryData<Project>(
          [PROJECTS_KEY, updatedProject.id],
          updatedProject
        );
        queryClient.invalidateQueries([PROJECTS_KEY]);
      },
      onError: (error) => {
        console.error('Failed to archive project:', error);
      },
    }
  );
};
