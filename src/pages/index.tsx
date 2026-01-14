import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import ProjectCard from '@/components/ProjectCard';
import TaskCard from '@/components/TaskCard';
import AnimatedButton from '@/components/AnimatedButton';
import { formatDate } from '@/lib/dates';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const Hero = styled.section`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl} 0;
`;

const Title = styled(motion.h1)`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.md};
`;

const Subtitle = styled(motion.p)`
  font-size: 1.125rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 600px;
  margin: 0 auto ${({ theme }) => theme.spacing.lg};
`;

const Stats = styled(motion.div)`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xl};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  min-width: 140px;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const TaskGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const SignInPrompt = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Today = styled.span`
  color: ${({ theme }) => theme.colors.primary};
`;

const Home: NextPage = () => {
  const { data: session, status } = useSession();
  const { data: projects = [], isLoading: projectsLoading } = useProjects({ archived: false });
  const { data: tasksData, isLoading: tasksLoading } = useTasks(
    { status: 'TODO' },
    1,
    6
  );

  const recentTasks = tasksData?.data || [];
  const today = formatDate(new Date(), 'EEEE, MMMM d');

  if (status === 'loading') {
    return (
      <Container>
        <Hero>
          <Title>Loading...</Title>
        </Hero>
      </Container>
    );
  }

  if (!session) {
    return (
      <Container>
        <Hero>
          <Title
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Welcome to TaskFlow
          </Title>
          <Subtitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            A powerful project and task management application to help you stay organized and
            productive.
          </Subtitle>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/auth/signin" passHref>
              <AnimatedButton size="lg">Get Started</AnimatedButton>
            </Link>
          </motion.div>
        </Hero>
      </Container>
    );
  }

  const totalTasks = tasksData?.total || 0;
  const completedTasks = projects.reduce((acc, p) => acc + (p.completedTaskCount || 0), 0);
  const totalProjects = projects.length;

  return (
    <>
      <Head>
        <title>TaskFlow - Dashboard</title>
      </Head>
      <Container>
        <Hero>
          <Title
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Good day, {session.user?.name?.split(' ')[0] || 'there'}!
          </Title>
          <Subtitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Today>{today}</Today> — Here&apos;s what&apos;s happening with your projects.
          </Subtitle>

          <Stats
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <StatCard>
              <StatValue>{totalProjects}</StatValue>
              <StatLabel>Active Projects</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{totalTasks}</StatValue>
              <StatLabel>Total Tasks</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{completedTasks}</StatValue>
              <StatLabel>Completed</StatLabel>
            </StatCard>
          </Stats>
        </Hero>

        <Section>
          <SectionHeader>
            <SectionTitle>Recent Projects</SectionTitle>
            <Link href="/projects" passHref>
              <AnimatedButton variant="secondary" size="sm">
                View All
              </AnimatedButton>
            </Link>
          </SectionHeader>
          {projectsLoading ? (
            <p>Loading projects...</p>
          ) : projects.length === 0 ? (
            <p>No projects yet. Create your first project to get started!</p>
          ) : (
            <ProjectGrid>
              {projects.slice(0, 3).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </ProjectGrid>
          )}
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>Upcoming Tasks</SectionTitle>
            <Link href="/tasks" passHref>
              <AnimatedButton variant="secondary" size="sm">
                View All
              </AnimatedButton>
            </Link>
          </SectionHeader>
          {tasksLoading ? (
            <p>Loading tasks...</p>
          ) : recentTasks.length === 0 ? (
            <p>No upcoming tasks. Great job staying on top of things!</p>
          ) : (
            <TaskGrid>
              {recentTasks.map((task) => (
                <TaskCard key={task.id} task={task} showProject />
              ))}
            </TaskGrid>
          )}
        </Section>
      </Container>
    </>
  );
};

export default Home;
