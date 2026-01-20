import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import TaskForm from '@/components/TaskForm';
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

const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Project One',
    description: null,
    color: '#6366f1',
    archived: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    ownerId: 'user-1',
  },
  {
    id: 'project-2',
    name: 'Project Two',
    description: null,
    color: '#22c55e',
    archived: false,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-19T11:00:00Z',
    ownerId: 'user-1',
  },
];

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('TaskForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  it('renders all form fields', () => {
    renderWithTheme(
      <TaskForm projects={mockProjects} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    expect(screen.getByLabelText(/Task Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Project/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Due Date/i)).toBeInTheDocument();
  });

  it('renders project options', () => {
    renderWithTheme(
      <TaskForm projects={mockProjects} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const projectSelect = screen.getByLabelText(/Project/i);
    expect(projectSelect).toContainHTML('Project One');
    expect(projectSelect).toContainHTML('Project Two');
  });

  it('shows validation error for empty title', async () => {
    renderWithTheme(
      <TaskForm projects={mockProjects} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const submitButton = screen.getByRole('button', { name: /Save Task/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Task title is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error for short title', async () => {
    renderWithTheme(
      <TaskForm projects={mockProjects} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const titleInput = screen.getByLabelText(/Task Title/i);
    await userEvent.type(titleInput, 'A');

    const submitButton = screen.getByRole('button', { name: /Save Task/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it('calls onSubmit with valid data', async () => {
    renderWithTheme(
      <TaskForm projects={mockProjects} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const titleInput = screen.getByLabelText(/Task Title/i);
    await userEvent.type(titleInput, 'New Test Task');

    const descriptionInput = screen.getByLabelText(/Description/i);
    await userEvent.type(descriptionInput, 'Task description here');

    const projectSelect = screen.getByLabelText(/Project/i);
    await userEvent.selectOptions(projectSelect, 'project-1');

    const submitButton = screen.getByRole('button', { name: /Save Task/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Test Task',
          description: 'Task description here',
          projectId: 'project-1',
        }),
        expect.anything()
      );
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    renderWithTheme(
      <TaskForm projects={mockProjects} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables submit button when loading', () => {
    renderWithTheme(
      <TaskForm
        projects={mockProjects}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={true}
      />
    );

    const submitButton = screen.getByRole('button', { name: /Saving/i });
    expect(submitButton).toBeDisabled();
  });

  it('sets quick date buttons correctly', async () => {
    renderWithTheme(
      <TaskForm projects={mockProjects} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const todayButton = screen.getByRole('button', { name: /Today/i });
    fireEvent.click(todayButton);

    const dueDateInput = screen.getByLabelText(/Due Date/i) as HTMLInputElement;
    const today = new Date().toISOString().split('T')[0];

    await waitFor(() => {
      expect(dueDateInput.value).toBe(today);
    });
  });

  it('renders with default values when provided', () => {
    const defaultValues = {
      title: 'Default Title',
      description: 'Default Description',
      status: 'IN_PROGRESS' as const,
      priority: 'HIGH' as const,
      projectId: 'project-2',
    };

    renderWithTheme(
      <TaskForm
        projects={mockProjects}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        defaultValues={defaultValues}
      />
    );

    expect(screen.getByLabelText(/Task Title/i)).toHaveValue('Default Title');
    expect(screen.getByLabelText(/Description/i)).toHaveValue('Default Description');
    expect(screen.getByLabelText(/Status/i)).toHaveValue('IN_PROGRESS');
    expect(screen.getByLabelText(/Priority/i)).toHaveValue('HIGH');
    expect(screen.getByLabelText(/Project/i)).toHaveValue('project-2');
  });

  it('renders all status options', () => {
    renderWithTheme(
      <TaskForm projects={mockProjects} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const statusSelect = screen.getByLabelText(/Status/i);
    expect(statusSelect).toContainHTML('To Do');
    expect(statusSelect).toContainHTML('In Progress');
    expect(statusSelect).toContainHTML('In Review');
    expect(statusSelect).toContainHTML('Done');
  });

  it('renders all priority options', () => {
    renderWithTheme(
      <TaskForm projects={mockProjects} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const prioritySelect = screen.getByLabelText(/Priority/i);
    expect(prioritySelect).toContainHTML('Low');
    expect(prioritySelect).toContainHTML('Medium');
    expect(prioritySelect).toContainHTML('High');
    expect(prioritySelect).toContainHTML('Urgent');
  });
});
