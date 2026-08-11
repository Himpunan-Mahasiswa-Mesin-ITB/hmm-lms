// ~/lib/schema/tryout.ts

import { QuestionType } from '@prisma/client';
import { z } from 'zod';

// ⬇️ *** THIS IS THE CORRECTED VALIDATION LOGIC *** ⬇️
const questionRefinement = (
  data: {
    type: QuestionType;
    options?: { isCorrect: boolean }[];
    // FIX: Updated the type to match the new schema for shortAnswers
    shortAnswers?: { value: string }[];
  },
  ctx: z.RefinementCtx,
) => {
  // Rule 1: Multiple choice questions must have at least 2 options (Unchanged)
  if (
    (data.type === QuestionType.MULTIPLE_CHOICE_SINGLE ||
      data.type === QuestionType.MULTIPLE_CHOICE_MULTIPLE) &&
    (!data.options || data.options.length < 2)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Multiple choice questions must have at least 2 options.',
      path: ['options'],
    });
  } // Rule 2: Single choice questions must have exactly one correct answer (Unchanged)

  if (data.type === QuestionType.MULTIPLE_CHOICE_SINGLE && data.options) {
    const correctAnswers = data.options.filter((opt) => opt.isCorrect).length;
    if (correctAnswers !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Single choice questions must have exactly one correct option.',
        path: ['options'],
      });
    }
  } // FIX: Rule 3 is now updated to validate the array of objects

  if (data.type === QuestionType.SHORT_ANSWER) {
    // Check if the array is missing, empty, or contains any objects with an empty `value` string.
    if (
      !data.shortAnswers ||
      data.shortAnswers.length === 0 ||
      data.shortAnswers.some((ans) => ans.value.trim() === '')
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Short answer questions must have at least one non-empty correct answer.',
        path: ['shortAnswers'],
      });
    }
  }
};

export const questionOptionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Option text cannot be empty'),
  isCorrect: z.boolean(),
  explanation: z.string().nullable().optional(),
  images: z.array(z.string().url()).optional(), // Added .url() for better validation
});

export const questionSchema = z
  .object({
    id: z.string().optional(),
    type: z.nativeEnum(QuestionType),
    question: z.string().min(1, 'Question text cannot be empty.'),
    points: z.number().min(1, 'Points must be at least 1.'),
    required: z.boolean(),
    images: z.array(z.string().url()).optional(), // Added .url()
    options: z.array(questionOptionSchema).optional(),
    shortAnswers: z.array(z.object({ value: z.string() })).optional(),
    explanationImages: z.array(z.string()).default([]), // Add this
    explanation: z.string().nullable().optional(),
  })
  .superRefine(questionRefinement);

export const createTryoutSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  duration: z.number().int().min(1, 'Duration must be at least 1 minute'),
  courseId: z.string().cuid('Course is required'),
  allowMultipleAttempts: z.boolean().default(true),
  allowViewCorrectAnswers: z.boolean().default(true),
  questions: z.array(questionSchema).min(1, 'At least one question is required'),
});

export const updateTryoutSchema = z.object({
  id: z.string(),
  title: z.string().min(3, 'Title must be at least 3 characters long.').optional(),
  description: z.string().optional(),
  duration: z.number().min(1, 'Duration must be at least 1 minute.').optional(),
  isActive: z.boolean().optional(),
  allowMultipleAttempts: z.boolean().default(true),
  allowViewCorrectAnswers: z.boolean().default(true),
  courseId: z.string().cuid('Please select a valid course.').optional(),
  questions: z
    .array(questionSchema) // Re-using the base question schema is cleaner
    .min(1, 'At least one question is required.')
    .optional(),
});

export const reshuffleTryoutShcema = z.object({
  id: z.string(),
});


export const tryoutIdSchema = z.object({
  id: z.string(),
});

export const courseIdSchema = z.object({
  courseId: z.string(),
});

// Export the inferred types
export type CreateTryoutInput = z.infer<typeof createTryoutSchema>;
export type UpdateTryoutInput = z.infer<typeof updateTryoutSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type QuestionOptionInput = z.infer<typeof questionOptionSchema>;
