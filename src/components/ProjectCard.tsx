import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Project } from '@/types';
import { formatRelativeTime } from '@/lib/dates';

const Card = styled(motion.div)<{ $color: string }>`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ $color }) => $color};
  }

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ProjectName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const ArchiveBadge = styled.span`
  background: ${({ theme }) => theme.colors.secondary};
  color: white;
  font-size: 0.75rem;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.875rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Stats = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const StatValue = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const StatLabel = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ProgressBar = styled.div`
  height: 4px;
  background: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  margin-top: ${({ theme }) => theme.spacing.md};
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $progress: number; $color: string }>`
  height: 100%;
  background: ${({ $color }) => $color};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  width: ${({ $progress }) => $progress}%;
  transition: width 0.3s ease;
`;

const UpdatedAt = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const taskCount = project.taskCount || 0;
  const completedCount = project.completedTaskCount || 0;
  const progress = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

  return (
    <Link href={`/projects/${project.id}`} passHref>
      <Card
        $color={project.color}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <CardHeader>
          <ProjectName>{project.name}</ProjectName>
          {project.archived && <ArchiveBadge>Archived</ArchiveBadge>}
        </CardHeader>

        {project.description && <Description>{project.description}</Description>}

        <Stats>
          <Stat>
            <StatValue>{taskCount}</StatValue>
            <StatLabel>tasks</StatLabel>
          </Stat>
          <Stat>
            <StatValue>{completedCount}</StatValue>
            <StatLabel>completed</StatLabel>
          </Stat>
          <Stat>
            <StatValue>{progress}%</StatValue>
            <StatLabel>progress</StatLabel>
          </Stat>
        </Stats>

        <ProgressBar>
          <ProgressFill $progress={progress} $color={project.color} />
        </ProgressBar>

        <UpdatedAt>Updated {formatRelativeTime(project.updatedAt)}</UpdatedAt>
      </Card>
    </Link>
  );
};

export default ProjectCard;
