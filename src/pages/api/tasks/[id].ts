import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '@/lib/prisma';
import { Task } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Task | { error: string }>
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

  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid task ID' });
  }

  const existingTask = await prisma.task.findUnique({
    where: { id },
    include: {
      project: true,
    },
  });

  if (!existingTask) {
    return res.status(404).json({ error: 'Task not found' });
  }


  if (req.method === 'GET') {
    const task = await prisma.task.findUnique({
      where: { id },
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
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.status(200).json({
      ...task,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      dueDate: task.dueDate?.toISOString() || null,
      completedAt: task.completedAt?.toISOString() || null,
      comments: task.comments.map((comment) => ({
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
      })),
    } as unknown as Task);
  }

  if (req.method === 'PUT') {
    const { title, description, status, priority, dueDate, assigneeId, tagIds } = req.body;

    const completedAt =
      status === 'DONE' && existingTask.status !== 'DONE' ? new Date() : existingTask.completedAt;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status, completedAt }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assigneeId !== undefined && { assigneeId }),
        ...(tagIds !== undefined && {
          tags: {
            set: tagIds.map((tagId: string) => ({ id: tagId })),
          },
        }),
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

    return res.status(200).json({
      ...task,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      dueDate: task.dueDate?.toISOString() || null,
      completedAt: task.completedAt?.toISOString() || null,
    } as unknown as Task);
  }

  if (req.method === 'PATCH') {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const completedAt = status === 'DONE' ? new Date() : null;

    const task = await prisma.task.update({
      where: { id },
      data: {
        status,
        completedAt,
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

    return res.status(200).json({
      ...task,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      dueDate: task.dueDate?.toISOString() || null,
      completedAt: task.completedAt?.toISOString() || null,
    } as unknown as Task);
  }

  if (req.method === 'DELETE') {
    await prisma.task.delete({
      where: { id },
    });

    return res.status(204).end();
  }

  res.setHeader('Allow', ['GET', 'PUT', 'PATCH', 'DELETE']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
