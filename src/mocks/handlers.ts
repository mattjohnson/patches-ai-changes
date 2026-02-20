import { http, HttpResponse } from 'msw';

const mockProjects = [
  {
    id: 'project-1',
    name: 'Website Redesign',
    description: 'Redesign the company website with new branding',
    color: '#6366f1',
    archived: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    ownerId: 'user-1',
    taskCount: 12,
    completedTaskCount: 5,
  },
  {
    id: 'project-2',
    name: 'Mobile App',
    description: 'Build the mobile application',
    color: '#22c55e',
    archived: false,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-19T11:00:00Z',
    ownerId: 'user-1',
    taskCount: 8,
    completedTaskCount: 2,
  },
];

const mockTasks = [
  {
    id: 'task-1',
    title: 'Design homepage mockups',
    description: 'Create initial mockups for the new homepage design',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2024-01-25T00:00:00Z',
    completedAt: null,
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-20T15:00:00Z',
    projectId: 'project-1',
    assigneeId: 'user-1',
    project: {
      id: 'project-1',
      name: 'Website Redesign',
      color: '#6366f1',
    },
  },
  {
    id: 'task-2',
    title: 'Implement authentication',
    description: 'Set up user authentication with OAuth providers',
    status: 'TODO',
    priority: 'URGENT',
    dueDate: '2024-01-22T00:00:00Z',
    completedAt: null,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z',
    projectId: 'project-2',
    assigneeId: null,
    project: {
      id: 'project-2',
      name: 'Mobile App',
      color: '#22c55e',
    },
  },
];

export const handlers = [
  http.get('*/api/projects', ({ request }) => {
    const url = new URL(request.url);
    const archived = url.searchParams.get('archived') === 'true';
    const filteredProjects = mockProjects.filter((p) => p.archived === archived);
    return HttpResponse.json(filteredProjects);
  }),

  http.get('*/api/projects/:id', ({ params }) => {
    const { id } = params;
    const project = mockProjects.find((p) => p.id === id);
    if (!project) {
      return HttpResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return HttpResponse.json(project);
  }),

  http.post('*/api/projects', async ({ request }) => {
    const body = await request.json();
    const newProject = {
      id: `project-${Date.now()}`,
      ...body,
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: 'user-1',
      taskCount: 0,
      completedTaskCount: 0,
    };
    return HttpResponse.json(newProject, { status: 201 });
  }),

  http.get('*/api/tasks', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10);
    const status = url.searchParams.get('status');
    const priority = url.searchParams.get('priority');
    const projectId = url.searchParams.get('projectId');

    let filteredTasks = [...mockTasks];

    if (status) {
      filteredTasks = filteredTasks.filter((t) => t.status === status);
    }
    if (priority) {
      filteredTasks = filteredTasks.filter((t) => t.priority === priority);
    }
    if (projectId) {
      filteredTasks = filteredTasks.filter((t) => t.projectId === projectId);
    }

    const total = filteredTasks.length;
    const start = (page - 1) * pageSize;
    const paginatedTasks = filteredTasks.slice(start, start + pageSize);

    return HttpResponse.json({
      data: paginatedTasks,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  }),

  http.get('*/api/tasks/:id', ({ params }) => {
    const { id } = params;
    const task = mockTasks.find((t) => t.id === id);
    if (!task) {
      return HttpResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    return HttpResponse.json(task);
  }),

  http.post('*/api/tasks', async ({ request }) => {
    const body = await request.json();
    const newTask = {
      id: `task-${Date.now()}`,
      ...body,
      status: body.status || 'TODO',
      priority: body.priority || 'MEDIUM',
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(newTask, { status: 201 });
  }),

  http.patch('*/api/tasks/:id/status', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();
    const task = mockTasks.find((t) => t.id === id);
    if (!task) {
      return HttpResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    const updatedTask = {
      ...task,
      status: body.status,
      completedAt: body.status === 'DONE' ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(updatedTask);
  }),
];
