import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  Project,
  Task,
  CreateProjectInput,
  UpdateProjectInput,
  CreateTaskInput,
  UpdateTaskInput,
  PaginatedResponse,
  TaskFilters,
  Comment,
} from '@/types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export const projectsApi = {
  getAll: async (params?: { archived?: boolean }): Promise<Project[]> => {
    const response = await api.get<Project[]>('/projects', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Project> => {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  create: async (data: CreateProjectInput): Promise<Project> => {
    const response = await api.post<Project>('/projects', data);
    return response.data;
  },

  update: async (id: string, data: UpdateProjectInput): Promise<Project> => {
    const response = await api.put<Project>(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  archive: async (id: string): Promise<Project> => {
    const response = await api.patch<Project>(`/projects/${id}/archive`);
    return response.data;
  },
};

export const tasksApi = {
  getAll: async (
    filters?: TaskFilters,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<Task>> => {
    const response = await api.get<PaginatedResponse<Task>>('/tasks', {
      params: { ...filters, page, pageSize },
    });
    return response.data;
  },

  getByProject: async (projectId: string): Promise<Task[]> => {
    const response = await api.get<PaginatedResponse<Task>>('/tasks', {
      params: { projectId, pageSize: 100 },
    });
    return response.data.data;
  },

  getById: async (id: string): Promise<Task> => {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  create: async (data: CreateTaskInput): Promise<Task> => {
    const response = await api.post<Task>('/tasks', data);
    return response.data;
  },

  update: async (id: string, data: UpdateTaskInput): Promise<Task> => {
    const response = await api.put<Task>(`/tasks/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  updateStatus: async (id: string, status: Task['status']): Promise<Task> => {
    const response = await api.patch<Task>(`/tasks/${id}/status`, { status });
    return response.data;
  },

  addComment: async (taskId: string, content: string): Promise<Comment> => {
    const response = await api.post<Comment>(`/tasks/${taskId}/comments`, { content });
    return response.data;
  },

  getComments: async (taskId: string): Promise<Comment[]> => {
    const response = await api.get<Comment[]>(`/tasks/${taskId}/comments`);
    return response.data;
  },
};

export const fetchWithRetry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && axios.isAxiosError(error) && error.response?.status !== undefined && error.response.status >= 500) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export default api;
