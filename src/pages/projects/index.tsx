import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useProjects, useCreateProject } from '@/hooks/useProjects';
import ProjectCard from '@/components/ProjectCard';
import ProjectForm from '@/components/ProjectForm';
import Modal from '@/components/Modal';
import AnimatedButton from '@/components/AnimatedButton';
interface ProjectFormData {
  name: string;
  description?: string;
  color: string;
}

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

const Tabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: none;
  border: none;
  font-size: 0.9375rem;
  font-weight: 500;
  color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.textSecondary)};
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ theme }) => theme.colors.primary};
    opacity: ${({ $active }) => ($active ? 1 : 0)};
    transition: opacity 0.2s ease;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Grid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ProjectsPage: NextPage = () => {
  const { data: session, status } = useSession();
  const [showArchived, setShowArchived] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: projects = [], isLoading } = useProjects({ archived: showArchived });
  const createProject = useCreateProject();

  const handleCreateProject = async (data: ProjectFormData) => {
    try {
      await createProject.mutateAsync(data);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <Container>
        <p>Loading...</p>
      </Container>
    );
  }

  if (!session) {
    return (
      <Container>
        <EmptyState>
          <p>Please sign in to view your projects.</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>Projects - TaskFlow</title>
      </Head>
      <Container>
        <Header>
          <Title>Projects</Title>
          <AnimatedButton onClick={() => setIsModalOpen(true)}>New Project</AnimatedButton>
        </Header>

        <Tabs>
          <Tab $active={!showArchived} onClick={() => setShowArchived(false)}>
            Active
          </Tab>
          <Tab $active={showArchived} onClick={() => setShowArchived(true)}>
            Archived
          </Tab>
        </Tabs>

        {projects.length === 0 ? (
          <EmptyState>
            <p>
              {showArchived
                ? 'No archived projects.'
                : 'No projects yet. Create your first project to get started!'}
            </p>
          </EmptyState>
        ) : (
          <Grid
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </Grid>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
          <ProjectForm
            onSubmit={handleCreateProject}
            onCancel={() => setIsModalOpen(false)}
            isLoading={createProject.isLoading}
          />
        </Modal>
      </Container>
    </>
  );
};

export default ProjectsPage;
