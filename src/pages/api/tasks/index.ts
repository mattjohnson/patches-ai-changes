import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '@/lib/prisma';
import { Task, PaginatedResponse } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaginatedResponse<Task> | Task | { error: string }>
) {
  const session = await getSession({ req });

  let user = await prisma.user.findUnique({
    where: { email: session?.user?.email || 'demo@taskflow.dev' },
  });

  if (!user) {
    user = await prisma.user.findFirst();
  }

  if (!user) {
    return res.status(401).json({ error: 'No users in database' });
  }

  if (req.method === 'GET') {
    const {
      status,
      priority,
      projectId,
      assigneeId,
      search,
      page = '1',
      pageSize = '20',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const pageSizeNum = parseInt(pageSize as string, 10);
    const skip = (pageNum - 1) * pageSizeNum;

    const where: any = {
      project: {
        ownerId: user.id,
      },
    };

    if (status && typeof status === 'string') {
      where.status = status;
    }

    if (priority && typeof priority === 'string') {
      where.priority = priority;
    }

    if (projectId && typeof projectId === 'string') {
      where.projectId = projectId;
    }

    if (assigneeId && typeof assigneeId === 'string') {
      where.assigneeId = assigneeId;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          tags: true,
        },
        skip,
        take: pageSizeNum,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.task.count({ where }),
    ]);

    const formattedTasks = tasks.map((task) => ({
      ...task,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      dueDate: task.dueDate?.toISOString() || null,
      completedAt: task.completedAt?.toISOString() || null,
    }));

    return res.status(200).json({
      data: formattedTasks as unknown as Task[],
      total,
      page: pageNum,
      pageSize: pageSizeNum,
      totalPages: Math.ceil(total / pageSizeNum),
    });
  }

  if (req.method === 'POST') {
    const { title, description, status, priority, dueDate, projectId, assigneeId, tagIds } =
      req.body;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!projectId || typeof projectId !== 'string') {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId: assigneeId || null,
        tags: tagIds?.length
          ? {
              connect: tagIds.map((id: string) => ({ id })),
            }
          : undefined,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        tags: true,
      },
    });

    return res.status(201).json({
      ...task,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      dueDate: task.dueDate?.toISOString() || null,
      completedAt: task.completedAt?.toISOString() || null,
    } as unknown as Task);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
