import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@taskflow.dev' },
    update: {},
    create: {
      email: 'demo@taskflow.dev',
      name: 'Demo User',
    },
  });

  console.log('Created demo user:', demoUser.email);

  const websiteProject = await prisma.project.upsert({
    where: { id: 'project-website' },
    update: {},
    create: {
      id: 'project-website',
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website with new branding and improved UX',
      color: '#6366f1',
      ownerId: demoUser.id,
    },
  });

  const mobileProject = await prisma.project.upsert({
    where: { id: 'project-mobile' },
    update: {},
    create: {
      id: 'project-mobile',
      name: 'Mobile App Development',
      description: 'Build native mobile applications for iOS and Android platforms',
      color: '#22c55e',
      ownerId: demoUser.id,
    },
  });

  const apiProject = await prisma.project.upsert({
    where: { id: 'project-api' },
    update: {},
    create: {
      id: 'project-api',
      name: 'API Integration',
      description: 'Integrate third-party APIs and build internal API infrastructure',
      color: '#f59e0b',
      ownerId: demoUser.id,
    },
  });

  console.log('Created projects');

  const tasks = [
    {
      id: 'task-1',
      title: 'Design new homepage layout',
      description: 'Create wireframes and mockups for the new homepage design following brand guidelines',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      projectId: websiteProject.id,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'task-2',
      title: 'Implement responsive navigation',
      description: 'Build a mobile-friendly navigation component with hamburger menu',
      status: 'TODO',
      priority: 'MEDIUM',
      projectId: websiteProject.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'task-3',
      title: 'Set up CI/CD pipeline',
      description: 'Configure automated testing and deployment workflow',
      status: 'DONE',
      priority: 'HIGH',
      projectId: websiteProject.id,
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'task-4',
      title: 'Create user authentication flow',
      description: 'Implement login, registration, and password reset functionality',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      projectId: mobileProject.id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'task-5',
      title: 'Design app icon and splash screen',
      description: 'Create app store assets including icon variations and launch screen',
      status: 'TODO',
      priority: 'MEDIUM',
      projectId: mobileProject.id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'task-6',
      title: 'Implement push notifications',
      description: 'Set up Firebase Cloud Messaging for push notification support',
      status: 'TODO',
      priority: 'LOW',
      projectId: mobileProject.id,
    },
    {
      id: 'task-7',
      title: 'Document REST API endpoints',
      description: 'Create OpenAPI/Swagger documentation for all API endpoints',
      status: 'IN_REVIEW',
      priority: 'MEDIUM',
      projectId: apiProject.id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'task-8',
      title: 'Implement rate limiting',
      description: 'Add rate limiting middleware to prevent API abuse',
      status: 'TODO',
      priority: 'HIGH',
      projectId: apiProject.id,
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'task-9',
      title: 'Set up API monitoring',
      description: 'Configure monitoring and alerting for API health and performance',
      status: 'DONE',
      priority: 'MEDIUM',
      projectId: apiProject.id,
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'task-10',
      title: 'Optimize database queries',
      description: 'Review and optimize slow database queries identified in monitoring',
      status: 'TODO',
      priority: 'HIGH',
      projectId: apiProject.id,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: {},
      create: task,
    });
  }

  console.log('Created tasks');

  const tags = [
    { id: 'tag-frontend', name: 'Frontend', color: '#3b82f6' },
    { id: 'tag-backend', name: 'Backend', color: '#8b5cf6' },
    { id: 'tag-design', name: 'Design', color: '#ec4899' },
    { id: 'tag-bug', name: 'Bug', color: '#ef4444' },
    { id: 'tag-feature', name: 'Feature', color: '#22c55e' },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { id: tag.id },
      update: {},
      create: tag,
    });
  }

  console.log('Created tags');
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
