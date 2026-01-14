import * as yup from 'yup';

export const projectSchema = yup.object().shape({
  name: yup
    .string()
    .required('Project name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  description: yup
    .string()
    .nullable()
    .max(500, 'Description must be less than 500 characters'),
  color: yup
    .string()
    .matches(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color')
    .default('#6366f1'),
});

export const taskSchema = yup.object().shape({
  title: yup
    .string()
    .required('Task title is required')
    .min(2, 'Title must be at least 2 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: yup
    .string()
    .nullable()
    .max(2000, 'Description must be less than 2000 characters'),
  status: yup
    .string()
    .oneOf(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'])
    .default('TODO'),
  priority: yup
    .string()
    .oneOf(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .default('MEDIUM'),
  dueDate: yup
    .date()
    .nullable()
    .min(new Date(), 'Due date cannot be in the past')
    .transform((value, originalValue) => {
      if (originalValue === '' || originalValue === null) return null;
      return value;
    }),
  projectId: yup.string().required('Project is required'),
  assigneeId: yup.string().nullable(),
});

export const commentSchema = yup.object().shape({
  content: yup
    .string()
    .required('Comment cannot be empty')
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must be less than 1000 characters'),
});

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Must be a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Must be a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password'), null], 'Passwords must match'),
});

export type ProjectFormData = yup.InferType<typeof projectSchema>;
export type TaskFormData = yup.InferType<typeof taskSchema>;
export type CommentFormData = yup.InferType<typeof commentSchema>;
export type LoginFormData = yup.InferType<typeof loginSchema>;
export type RegisterFormData = yup.InferType<typeof registerSchema>;
