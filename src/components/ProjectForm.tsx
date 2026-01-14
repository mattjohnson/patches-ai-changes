import React from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectFormData {
  name: string;
  description?: string;
  color: string;
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
`;

const TextArea = styled.textarea<{ $hasError?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid
    ${({ theme, $hasError }) => ($hasError ? theme.colors.error : theme.colors.border)};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.9375rem;
  outline: none;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${({ theme, $hasError }) =>
      $hasError ? theme.colors.error : theme.colors.primary};
  }
`;

const ErrorMessage = styled(motion.span)`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.error};
`;

const ColorPicker = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const ColorOption = styled.button<{ $color: string; $selected: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ $color }) => $color};
  border: 3px solid ${({ $selected, theme }) => ($selected ? theme.colors.text : 'transparent')};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
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

const projectColors = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f59e0b',
  '#22c55e',
  '#14b8a6',
  '#3b82f6',
  '#64748b',
];

interface ProjectFormProps {
  onSubmit: (data: ProjectFormData) => void;
  onCancel: () => void;
  defaultValues?: Partial<ProjectFormData>;
  isLoading?: boolean;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormData>({
    defaultValues: {
      name: '',
      description: '',
      color: '#6366f1',
      ...defaultValues,
    },
  });

  const selectedColor = watch('color');

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormGroup>
        <Label htmlFor="name">Project Name *</Label>
        <Input
          id="name"
          name="name"
          ref={register({ required: 'Project name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
          placeholder="Enter project name"
          $hasError={!!errors.name}
        />
        <AnimatePresence>
          {errors.name && (
            <ErrorMessage
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {errors.name.message}
            </ErrorMessage>
          )}
        </AnimatePresence>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="description">Description</Label>
        <TextArea
          id="description"
          name="description"
          ref={register}
          placeholder="What's this project about?"
          $hasError={!!errors.description}
        />
        <AnimatePresence>
          {errors.description && (
            <ErrorMessage
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {errors.description.message}
            </ErrorMessage>
          )}
        </AnimatePresence>
      </FormGroup>

      <FormGroup>
        <Label>Color</Label>
        <ColorPicker>
          {projectColors.map((color) => (
            <ColorOption
              key={color}
              type="button"
              $color={color}
              $selected={selectedColor === color}
              onClick={() => setValue('color', color)}
              aria-label={`Select color ${color}`}
            />
          ))}
        </ColorPicker>
      </FormGroup>

      <ButtonGroup>
        <Button type="button" $variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Project'}
        </Button>
      </ButtonGroup>
    </Form>
  );
};

export default ProjectForm;
