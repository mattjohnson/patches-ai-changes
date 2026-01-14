import { rest } from 'msw';

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
  rest.get('/api/projects', (req, res, ctx) => {
    const archived = req.url.searchParams.get('archived') === 'true';
    const filteredProjects = mockProjects.filter((p) => p.archived === archived);
    return res(ctx.json(filteredProjects));
  }),

  rest.get('/api/projects/:id', (req, res, ctx) => {
    const { id } = req.params;
    const project = mockProjects.find((p) => p.id === id);
    if (!project) {
      return res(ctx.status(404), ctx.json({ error: 'Project not found' }));
    }
    return res(ctx.json(project));
  }),

  rest.post('/api/projects', async (req, res, ctx) => {
    const body = await req.json();
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
    return res(ctx.status(201), ctx.json(newProject));
  }),

  rest.get('/api/tasks', (req, res, ctx) => {
    const page = parseInt(req.url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(req.url.searchParams.get('pageSize') || '20', 10);
    const status = req.url.searchParams.get('status');
    const priority = req.url.searchParams.get('priority');
    const projectId = req.url.searchParams.get('projectId');

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

    return res(
      ctx.json({
        data: paginatedTasks,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      })
    );
  }),

  rest.get('/api/tasks/:id', (req, res, ctx) => {
    const { id } = req.params;
    const task = mockTasks.find((t) => t.id === id);
    if (!task) {
      return res(ctx.status(404), ctx.json({ error: 'Task not found' }));
    }
    return res(ctx.json(task));
  }),

  rest.post('/api/tasks', async (req, res, ctx) => {
    const body = await req.json();
    const newTask = {
      id: `task-${Date.now()}`,
      ...body,
      status: body.status || 'TODO',
      priority: body.priority || 'MEDIUM',
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return res(ctx.status(201), ctx.json(newTask));
  }),

  rest.patch('/api/tasks/:id/status', async (req, res, ctx) => {
    const { id } = req.params;
    const body = await req.json();
    const task = mockTasks.find((t) => t.id === id);
    if (!task) {
      return res(ctx.status(404), ctx.json({ error: 'Task not found' }));
    }
    const updatedTask = {
      ...task,
      status: body.status,
      completedAt: body.status === 'DONE' ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    };
    return res(ctx.json(updatedTask));
  }),
];
