import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, TaskStatus, Priority } from '@/types';
import { addDays } from '@/lib/dates';

interface TaskFormData {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  projectId: string;
  dueDate?: Date | null;
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid
    ${({ theme, $hasError }) => ($hasError ? theme.colors.error : theme.colors.border)};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.9375rem;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${({ theme, $hasError }) =>
      $hasError ? theme.colors.error : theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const TextArea = styled.textarea<{ $hasError?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid
    ${({ theme, $hasError }) => ($hasError ? theme.colors.error : theme.colors.border)};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.9375rem;
  outline: none;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${({ theme, $hasError }) =>
      $hasError ? theme.colors.error : theme.colors.primary};
  }
`;

const Select = styled.select<{ $hasError?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid
    ${({ theme, $hasError }) => ($hasError ? theme.colors.error : theme.colors.border)};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.9375rem;
  outline: none;
  background: white;
  cursor: pointer;

  &:focus {
    border-color: ${({ theme, $hasError }) =>
      $hasError ? theme.colors.error : theme.colors.primary};
  }
`;

const ErrorMessage = styled(motion.span)`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.error};
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ theme, $variant = 'primary' }) =>
    $variant === 'primary'
      ? `
        background: ${theme.colors.primary};
        color: white;
        border: none;

        &:hover {
          background: ${theme.colors.primaryHover};
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `
      : `
        background: transparent;
        color: ${theme.colors.textSecondary};
        border: 1px solid ${theme.colors.border};

        &:hover {
          border-color: ${theme.colors.primary};
          color: ${theme.colors.primary};
        }
      `}
`;

const QuickDateButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const QuickDateButton = styled.button`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: transparent;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

interface TaskFormProps {
  projects: Project[];
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  defaultValues?: Partial<TaskFormData>;
  isLoading?: boolean;
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'DONE', label: 'Done' },
];

const priorityOptions: { value: Priority; label: string }[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

const TaskForm: React.FC<TaskFormProps> = ({
  projects,
  onSubmit,
  onCancel,
  defaultValues,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    defaultValues: {
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      projectId: projects[0]?.id || '',
      dueDate: null,
      ...defaultValues,
    },
  });

  const setQuickDate = (days: number) => {
    const date = addDays(new Date(), days);
    setValue('dueDate', date);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormGroup>
        <Label htmlFor="title">Task Title *</Label>
        <Input
          id="title"
          {...register('title', { required: 'Task title is required', minLength: { value: 2, message: 'Title must be at least 2 characters' } })}
          placeholder="Enter task title"
          $hasError={!!errors.title}
        />
        <AnimatePresence>
          {errors.title && (
            <ErrorMessage
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {errors.title.message}
            </ErrorMessage>
          )}
        </AnimatePresence>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="description">Description</Label>
        <TextArea
          id="description"
          {...register('description')}
          placeholder="Add a description..."
          $hasError={!!errors.description}
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="projectId">Project *</Label>
        <Select
          id="projectId"
          {...register('projectId', { required: 'Project is required' })}
          $hasError={!!errors.projectId}
        >
          <option value="">Select a project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </Select>
        <AnimatePresence>
          {errors.projectId && (
            <ErrorMessage
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {errors.projectId.message}
            </ErrorMessage>
          )}
        </AnimatePresence>
      </FormGroup>

      <Row>
        <FormGroup>
          <Label htmlFor="status">Status</Label>
          <Select id="status" {...register('status')}>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="priority">Priority</Label>
          <Select id="priority" {...register('priority')}>
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormGroup>
      </Row>

      <FormGroup>
        <Label htmlFor="dueDate">Due Date</Label>
        <Controller
          name="dueDate"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              id="dueDate"
              type="date"
              value={value ? new Date(value).toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const val = e.target.value;
                onChange(val ? new Date(val) : null);
              }}
              $hasError={!!errors.dueDate}
            />
          )}
        />
        <QuickDateButtons>
          <QuickDateButton type="button" onClick={() => setQuickDate(0)}>
            Today
          </QuickDateButton>
          <QuickDateButton type="button" onClick={() => setQuickDate(1)}>
            Tomorrow
          </QuickDateButton>
          <QuickDateButton type="button" onClick={() => setQuickDate(7)}>
            Next week
          </QuickDateButton>
        </QuickDateButtons>
      </FormGroup>

      <ButtonGroup>
        <Button type="button" $variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Task'}
        </Button>
      </ButtonGroup>
    </Form>
  );
};

export default TaskForm;
