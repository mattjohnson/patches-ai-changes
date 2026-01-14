import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Task, TaskStatus } from '@/types';
import TaskCard from './TaskCard';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
`;

const EmptyDescription = styled.p`
  margin: 0;
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.lg};

  &:first-child {
    margin-top: 0;
  }
`;

const GroupTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
`;

const GroupCount = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.border};
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
`;

const TaskGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

interface TaskListProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  groupBy?: 'status' | 'priority' | 'none';
  showProject?: boolean;
  emptyMessage?: string;
}

const statusOrder: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const statusLabels: Record<TaskStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
};

const priorityLabels: Record<string, string> = {
  URGENT: 'Urgent',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskClick,
  onStatusChange,
  groupBy = 'none',
  showProject = false,
  emptyMessage = 'No tasks yet',
}) => {
  if (tasks.length === 0) {
    return (
      <EmptyState
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <EmptyIcon>📋</EmptyIcon>
        <EmptyTitle>{emptyMessage}</EmptyTitle>
        <EmptyDescription>Create a new task to get started</EmptyDescription>
      </EmptyState>
    );
  }

  const renderTasks = (taskList: Task[]) => (
    <TaskGroup>
      <AnimatePresence>
        {taskList.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick?.(task)}
            onStatusChange={onStatusChange}
            showProject={showProject}
          />
        ))}
      </AnimatePresence>
    </TaskGroup>
  );

  if (groupBy === 'none') {
    return (
      <Container>
        <LayoutGroup>{renderTasks(tasks)}</LayoutGroup>
      </Container>
    );
  }

  if (groupBy === 'status') {
    const groupedTasks = statusOrder.reduce((acc, status) => {
      acc[status] = tasks.filter((task) => task.status === status);
      return acc;
    }, {} as Record<TaskStatus, Task[]>);

    return (
      <Container>
        <LayoutGroup>
          {statusOrder.map((status) => {
            const statusTasks = groupedTasks[status];
            if (statusTasks.length === 0) return null;

            return (
              <div key={status}>
                <GroupHeader>
                  <GroupTitle>{statusLabels[status]}</GroupTitle>
                  <GroupCount>{statusTasks.length}</GroupCount>
                </GroupHeader>
                {renderTasks(statusTasks)}
              </div>
            );
          })}
        </LayoutGroup>
      </Container>
    );
  }

  if (groupBy === 'priority') {
    const priorityOrder = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];
    const groupedTasks = priorityOrder.reduce((acc, priority) => {
      acc[priority] = tasks.filter((task) => task.priority === priority);
      return acc;
    }, {} as Record<string, Task[]>);

    return (
      <Container>
        <LayoutGroup>
          {priorityOrder.map((priority) => {
            const priorityTasks = groupedTasks[priority];
            if (priorityTasks.length === 0) return null;

            return (
              <div key={priority}>
                <GroupHeader>
                  <GroupTitle>{priorityLabels[priority]}</GroupTitle>
                  <GroupCount>{priorityTasks.length}</GroupCount>
                </GroupHeader>
                {renderTasks(priorityTasks)}
              </div>
            );
          })}
        </LayoutGroup>
      </Container>
    );
  }

  return null;
};

export default TaskList;
