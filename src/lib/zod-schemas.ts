import { z } from 'zod';

export const createSubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  priority: z.enum(['High', 'Medium', 'Low']),
  status: z.enum(['NotStarted', 'InProgress', 'Paused', 'Completed']).default('NotStarted'),
  targetDate: z.string().optional(),
});

export const toggleTaskSchema = z.object({
  taskId: z.string(),
  completed: z.boolean(),
});

export const deleteSubjectSchema = z.object({
  subjectId: z.string(),
});

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
