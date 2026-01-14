import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import ProjectCard from '@/components/ProjectCard';
import { Project } from '@/types';

const theme = {
  colors: {
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    secondary: '#64748b',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
};

const mockProject: Project = {
  id: 'project-1',
  name: 'Test Project',
  description: 'A test project description',
  color: '#6366f1',
  archived: false,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-20T14:30:00Z',
  ownerId: 'user-1',
  taskCount: 10,
  completedTaskCount: 5,
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('ProjectCard', () => {
  it('renders project name correctly', () => {
    renderWithTheme(<ProjectCard project={mockProject} />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('renders project description', () => {
    renderWithTheme(<ProjectCard project={mockProject} />);
    expect(screen.getByText('A test project description')).toBeInTheDocument();
  });

  it('displays task count statistics', () => {
    renderWithTheme(<ProjectCard project={mockProject} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('tasks')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  it('calculates and displays progress percentage', () => {
    renderWithTheme(<ProjectCard project={mockProject} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('shows archived badge when project is archived', () => {
    const archivedProject = { ...mockProject, archived: true };
    renderWithTheme(<ProjectCard project={archivedProject} />);
    expect(screen.getByText('Archived')).toBeInTheDocument();
  });

  it('does not show archived badge for active projects', () => {
    renderWithTheme(<ProjectCard project={mockProject} />);
    expect(screen.queryByText('Archived')).not.toBeInTheDocument();
  });

  it('handles projects with no tasks', () => {
    const emptyProject = { ...mockProject, taskCount: 0, completedTaskCount: 0 };
    renderWithTheme(<ProjectCard project={emptyProject} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('handles projects with no description', () => {
    const noDescProject = { ...mockProject, description: null };
    renderWithTheme(<ProjectCard project={noDescProject} />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.queryByText('A test project description')).not.toBeInTheDocument();
  });

  it('displays relative update time', () => {
    renderWithTheme(<ProjectCard project={mockProject} />);
    const updateText = screen.getByText(/Updated/);
    expect(updateText).toBeInTheDocument();
  });

  it('links to the project detail page', () => {
    renderWithTheme(<ProjectCard project={mockProject} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/projects/project-1');
  });
});
