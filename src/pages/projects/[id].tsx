import type { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useProject, useUpdateProject, useDeleteProject, useArchiveProject } from '@/hooks/useProjects';
import { useProjectTasks, useCreateTask, useUpdateTaskStatus } from '@/hooks/useTasks';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';
import Modal from '@/components/Modal';
import AnimatedButton from '@/components/AnimatedButton';
import { TaskFormData } from '@/lib/validation';
import { formatDate } from '@/lib/dates';
import { Task, TaskStatus } from '@/types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const ProjectColor = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  display: inline-block;
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
`;

const Meta = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
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
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const FilterBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FilterButton = styled.button<{ $active: boolean }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border: 1px solid
    ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ theme, $active }) => ($active ? `${theme.colors.primary}10` : 'transparent')};
  color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.textSecondary)};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

interface ProjectPageProps {
  projectId: string;
}

const ProjectPage: NextPage<ProjectPageProps> = ({ projectId }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [groupBy, setGroupBy] = useState<'status' | 'priority' | 'none'>('status');

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: tasks = [], isLoading: tasksLoading } = useProjectTasks(projectId);
  const createTask = useCreateTask();
  const updateTaskStatus = useUpdateTaskStatus();
  const archiveProject = useArchiveProject();
  const deleteProject = useDeleteProject();

  const handleCreateTask = async (data: TaskFormData) => {
    try {
      await createTask.mutateAsync({
        ...data,
        projectId,
        dueDate: data.dueDate?.toISOString(),
      });
      setIsTaskModalOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await updateTaskStatus.mutateAsync({ id: taskId, status });
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleArchive = async () => {
    if (!project) return;
    const confirmMessage = project.archived
      ? 'Unarchive this project?'
      : 'Archive this project? It will be moved to the archived tab.';
    if (confirm(confirmMessage)) {
      await archiveProject.mutateAsync(projectId);
    }
  };

  const handleDelete = async () => {
    if (confirm('Delete this project? This action cannot be undone.')) {
      await deleteProject.mutateAsync(projectId);
      router.push('/projects');
    }
  };

  if (projectLoading || !project) {
    return (
      <Container>
        <p>Loading project...</p>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>{project.name} - TaskFlow</title>
      </Head>
      <Container>
        <Header>
          <HeaderContent>
            <Title>
              <ProjectColor $color={project.color} />
              {project.name}
            </Title>
            {project.description && <Description>{project.description}</Description>}
            <Meta>
              Created {formatDate(project.createdAt)} · Updated {formatDate(project.updatedAt)}
            </Meta>
          </HeaderContent>
          <Actions>
            <AnimatedButton variant="secondary" size="sm" onClick={handleArchive}>
              {project.archived ? 'Unarchive' : 'Archive'}
            </AnimatedButton>
            <AnimatedButton variant="danger" size="sm" onClick={handleDelete}>
              Delete
            </AnimatedButton>
          </Actions>
        </Header>

        <Section>
          <SectionHeader>
            <SectionTitle>Tasks ({tasks.length})</SectionTitle>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <FilterBar>
                <FilterButton
                  $active={groupBy === 'none'}
                  onClick={() => setGroupBy('none')}
                >
                  All
                </FilterButton>
                <FilterButton
                  $active={groupBy === 'status'}
                  onClick={() => setGroupBy('status')}
                >
                  By Status
                </FilterButton>
                <FilterButton
                  $active={groupBy === 'priority'}
                  onClick={() => setGroupBy('priority')}
                >
                  By Priority
                </FilterButton>
              </FilterBar>
              <AnimatedButton size="sm" onClick={() => setIsTaskModalOpen(true)}>
                Add Task
              </AnimatedButton>
            </div>
          </SectionHeader>

          {tasksLoading ? (
            <p>Loading tasks...</p>
          ) : (
            <TaskList
              tasks={tasks}
              onStatusChange={handleStatusChange}
              groupBy={groupBy}
              emptyMessage="No tasks in this project yet"
            />
          )}
        </Section>

        <Modal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          title="Add New Task"
        >
          <TaskForm
            projects={[project]}
            onSubmit={handleCreateTask}
            onCancel={() => setIsTaskModalOpen(false)}
            isLoading={createTask.isLoading}
            defaultValues={{ projectId }}
          />
        </Modal>
      </Container>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  return {
    props: {
      projectId: context.params?.id as string,
    },
  };
};

export default ProjectPage;
