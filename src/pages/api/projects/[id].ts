import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '@/lib/prisma';
import { Project } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Project | { error: string }>
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
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  const existingProject = await prisma.project.findUnique({
    where: { id },
  });

  if (!existingProject) {
    return res.status(404).json({ error: 'Project not found' });
  }


  if (req.method === 'GET') {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        tasks: {
          include: {
            assignee: {
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

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.status(200).json({
      ...project,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      tasks: project.tasks.map((task) => ({
        ...task,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        dueDate: task.dueDate?.toISOString() || null,
        completedAt: task.completedAt?.toISOString() || null,
      })),
    } as unknown as Project);
  }

  if (req.method === 'PUT') {
    const { name, description, color, archived } = req.body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(color !== undefined && { color }),
        ...(archived !== undefined && { archived }),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return res.status(200).json({
      ...project,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    } as unknown as Project);
  }

  if (req.method === 'PATCH') {
    const project = await prisma.project.update({
      where: { id },
      data: {
        archived: !existingProject.archived,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return res.status(200).json({
      ...project,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    } as unknown as Project);
  }

  if (req.method === 'DELETE') {
    await prisma.project.delete({
      where: { id },
    });

    return res.status(204).end();
  }

  res.setHeader('Allow', ['GET', 'PUT', 'PATCH', 'DELETE']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
