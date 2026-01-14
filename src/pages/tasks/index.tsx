import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import styled from 'styled-components';
import { useTasks, useUpdateTaskStatus, useCreateTask } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';
import Modal from '@/components/Modal';
import AnimatedButton from '@/components/AnimatedButton';
import { TaskFormData } from '@/lib/validation';
import { TaskStatus, Priority, TaskFilters } from '@/types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const FilterLabel = styled.label`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const FilterSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
  min-width: 120px;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: none;
  }
`;

const SearchInput = styled.input`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.875rem;
  min-width: 200px;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: none;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ViewButton = styled.button<{ $active: boolean }>`
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

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const PageInfo = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TasksPage: NextPage = () => {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [page, setPage] = useState(1);
  const [groupBy, setGroupBy] = useState<'status' | 'priority' | 'none'>('none');

  const { data: projects = [] } = useProjects({ archived: false });
  const { data: tasksData, isLoading } = useTasks(filters, page, 20);
  const createTask = useCreateTask();
  const updateTaskStatus = useUpdateTaskStatus();

  const tasks = tasksData?.data || [];
  const totalPages = tasksData?.totalPages || 1;

  const handleCreateTask = async (data: TaskFormData) => {
    try {
      await createTask.mutateAsync({
        ...data,
        dueDate: data.dueDate?.toISOString(),
      });
      setIsModalOpen(false);
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

  const handleFilterChange = (key: keyof TaskFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
    setPage(1);
  };

  if (!session) {
    return (
      <Container>
        <p>Please sign in to view your tasks.</p>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>Tasks - TaskFlow</title>
      </Head>
      <Container>
        <Header>
          <Title>Tasks</Title>
          <AnimatedButton onClick={() => setIsModalOpen(true)}>New Task</AnimatedButton>
        </Header>

        <FiltersContainer>
          <FilterGroup>
            <FilterLabel>Search</FilterLabel>
            <SearchInput
              type="text"
              placeholder="Search tasks..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Status</FilterLabel>
            <FilterSelect
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Priority</FilterLabel>
            <FilterSelect
              value={filters.priority || ''}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="">All</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Project</FilterLabel>
            <FilterSelect
              value={filters.projectId || ''}
              onChange={(e) => handleFilterChange('projectId', e.target.value)}
            >
              <option value="">All Projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Group By</FilterLabel>
            <ViewToggle>
              <ViewButton $active={groupBy === 'none'} onClick={() => setGroupBy('none')}>
                None
              </ViewButton>
              <ViewButton $active={groupBy === 'status'} onClick={() => setGroupBy('status')}>
                Status
              </ViewButton>
              <ViewButton $active={groupBy === 'priority'} onClick={() => setGroupBy('priority')}>
                Priority
              </ViewButton>
            </ViewToggle>
          </FilterGroup>
        </FiltersContainer>

        {isLoading ? (
          <p>Loading tasks...</p>
        ) : (
          <>
            <TaskList
              tasks={tasks}
              onStatusChange={handleStatusChange}
              groupBy={groupBy}
              showProject
              emptyMessage="No tasks found"
            />

            {totalPages > 1 && (
              <Pagination>
                <AnimatedButton
                  variant="secondary"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </AnimatedButton>
                <PageInfo>
                  Page {page} of {totalPages}
                </PageInfo>
                <AnimatedButton
                  variant="secondary"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </AnimatedButton>
              </Pagination>
            )}
          </>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Task">
          <TaskForm
            projects={projects}
            onSubmit={handleCreateTask}
            onCancel={() => setIsModalOpen(false)}
            isLoading={createTask.isLoading}
          />
        </Modal>
      </Container>
    </>
  );
};

export default TasksPage;
