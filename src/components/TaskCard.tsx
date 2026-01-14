import React from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { Task, Priority, TaskStatus } from '@/types';
import { formatDueDate, getDueDateStatus } from '@/lib/dates';

const priorityColors: Record<Priority, string> = {
  LOW: '#94a3b8',
  MEDIUM: '#3b82f6',
  HIGH: '#f59e0b',
  URGENT: '#ef4444',
};

const statusColors: Record<TaskStatus, string> = {
  TODO: '#94a3b8',
  IN_PROGRESS: '#3b82f6',
  IN_REVIEW: '#8b5cf6',
  DONE: '#22c55e',
};

const Card = styled(motion.div)<{ $isDone: boolean }>`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ $isDone }) =>
    $isDone &&
    css`
      opacity: 0.7;
    `}

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Checkbox = styled.div<{ $checked: boolean; $color: string }>`
  width: 20px;
  height: 20px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 2px solid ${({ $color }) => $color};
  background: ${({ $checked, $color }) => ($checked ? $color : 'transparent')};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.2s ease;

  &::after {
    content: '✓';
    color: white;
    font-size: 12px;
    opacity: ${({ $checked }) => ($checked ? 1 : 0)};
  }
`;

const Title = styled.h4<{ $isDone: boolean }>`
  font-size: 0.9375rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  flex: 1;

  ${({ $isDone }) =>
    $isDone &&
    css`
      text-decoration: line-through;
      color: ${({ theme }) => theme.colors.textSecondary};
    `}
`;

const Description = styled.p`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Tags = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  flex-wrap: wrap;
`;

const Tag = styled.span<{ $color: string }>`
  font-size: 0.6875rem;
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ $color }) => `${$color}20`};
  color: ${({ $color }) => $color};
`;

const PriorityBadge = styled.span<{ $priority: Priority }>`
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ $priority }) => `${priorityColors[$priority]}20`};
  color: ${({ $priority }) => priorityColors[$priority]};
  text-transform: uppercase;
`;

const StatusBadge = styled.span<{ $status: TaskStatus }>`
  font-size: 0.6875rem;
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ $status }) => `${statusColors[$status]}20`};
  color: ${({ $status }) => statusColors[$status]};
`;

const DueDate = styled.span<{ $status: 'overdue' | 'due-soon' | 'upcoming' | null }>`
  font-size: 0.75rem;
  color: ${({ theme, $status }) => {
    switch ($status) {
      case 'overdue':
        return theme.colors.error;
      case 'due-soon':
        return theme.colors.warning;
      default:
        return theme.colors.textSecondary;
    }
  }};
`;

const ProjectBadge = styled.span<{ $color: string }>`
  font-size: 0.6875rem;
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ $color }) => $color};
  color: white;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Assignee = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const AssigneeAvatar = styled.img`
  width: 20px;
  height: 20px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
`;

const AssigneeName = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onClick?: () => void;
  showProject?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onStatusChange,
  onClick,
  showProject = false,
}) => {
  const isDone = task.status === 'DONE';
  const dueDateStatus = task.dueDate ? getDueDateStatus(task.dueDate) : null;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStatusChange) {
      onStatusChange(task.id, isDone ? 'TODO' : 'DONE');
    }
  };

  return (
    <Card
      $isDone={isDone}
      onClick={onClick}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Header>
        <Checkbox
          $checked={isDone}
          $color={statusColors[task.status]}
          onClick={handleCheckboxClick}
        />
        <Title $isDone={isDone}>{task.title}</Title>
        <PriorityBadge $priority={task.priority}>{task.priority}</PriorityBadge>
      </Header>

      {task.description && <Description>{task.description}</Description>}

      <Footer>
        <Tags>
          <StatusBadge $status={task.status}>{task.status.replace('_', ' ')}</StatusBadge>
          {showProject && task.project && (
            <ProjectBadge $color={task.project.color}>{task.project.name}</ProjectBadge>
          )}
          {task.tags?.map((tag) => (
            <Tag key={tag.id} $color={tag.color}>
              {tag.name}
            </Tag>
          ))}
        </Tags>

        <Meta>
          {task.dueDate && (
            <DueDate $status={dueDateStatus}>{formatDueDate(task.dueDate)}</DueDate>
          )}
          {task.assignee && (
            <Assignee>
              {task.assignee.image && (
                <AssigneeAvatar src={task.assignee.image} alt={task.assignee.name || ''} />
              )}
              <AssigneeName>{task.assignee.name}</AssigneeName>
            </Assignee>
          )}
        </Meta>
      </Footer>
    </Card>
  );
};

export default TaskCard;
