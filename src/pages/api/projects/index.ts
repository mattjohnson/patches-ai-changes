import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '@/lib/prisma';
import { Project } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Project[] | Project | { error: string }>
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
    const { archived } = req.query;

    const projects = await prisma.project.findMany({
      where: {
        ownerId: user.id,
        archived: archived === 'true',
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
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const completedCount = await prisma.task.count({
          where: {
            projectId: project.id,
            status: 'DONE',
          },
        });

        return {
          ...project,
          taskCount: project._count.tasks,
          completedTaskCount: completedCount,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
        };
      })
    );

    return res.status(200).json(projectsWithCounts as unknown as Project[]);
  }

  if (req.method === 'POST') {
    const { name, description, color } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name is required' });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        color: color || '#6366f1',
        ownerId: user.id,
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

    return res.status(201).json({
      ...project,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    } as unknown as Project);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
