import {
  Type,
  MessageSquare,
  CheckSquare,
  Star,
  Upload,
  User,
  Hash,
  BookOpen,
  Calendar,
  Clock,
} from 'lucide-react';
import { z } from 'zod';

// --- 1. CENTRAL CONFIGURATION FOR QUESTION TYPES ---
// This object's keys MUST match the `FormQuestionType` enum in your Prisma schema.
export const QUESTION_TYPE_CONFIG = {
  SHORT_ANSWER: {
    type: 'SHORT_ANSWER',
    label: 'Short Answer',
    description: 'A short text response',
    icon: Type,
  },
  LONG_ANSWER: {
    type: 'LONG_ANSWER',
    label: 'Long Answer',
    description: 'A long text response',
    icon: Type,
  },
  MULTIPLE_CHOICE: {
    type: 'MULTIPLE_CHOICE',
    label: 'Multiple Choice',
    description: 'Select one option',
    icon: MessageSquare,
  },
  MULTIPLE_SELECT: {
    type: 'MULTIPLE_SELECT',
    label: 'Checkboxes',
    description: 'Select multiple options',
    icon: CheckSquare,
  },
  FILE_UPLOAD: {
    type: 'FILE_UPLOAD',
    label: 'File Upload',
    description: 'Upload one or more files',
    icon: Upload,
  },
  NAME_SELECT: {
    type: 'NAME_SELECT',
    label: 'Name Select',
    description: 'Select a user by name',
    icon: User,
  },
  NIM_SELECT: {
    type: 'NIM_SELECT',
    label: 'NIM Select',
    description: 'Select a student by NIM',
    icon: Hash,
  },
  RATING: {
    type: 'RATING',
    label: 'Rating',
    description: 'A scale of stars, hearts, etc.',
    icon: Star,
  },
  DATE: { type: 'DATE', label: 'Date', description: 'Pick a specific date', icon: Calendar },
  TIME: { type: 'TIME', label: 'Time', description: 'Pick a specific time', icon: Clock },
  COURSE_SELECT: {
    type: 'COURSE_SELECT',
    label: 'Course Select',
    description: 'Select a course from a list',
    icon: BookOpen,
  },
  EVENT_SELECT: {
    type: 'EVENT_SELECT',
    label: 'Event Select',
    description: 'Select an event from a list',
    icon: Calendar,
  },
} as const;

// --- 2. DERIVED TYPES AND ZOD SCHEMas ---
export type FormQuestionType = keyof typeof QUESTION_TYPE_CONFIG;

// --- 3. Schemas for the `settings` JSON object in the `FormQuestion` model ---
export const TextSettingsSchema = z.object({ placeholder: z.string().optional() });
export type TextSettings = z.infer<typeof TextSettingsSchema>;

export const MultipleChoiceOptionSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  text: z.string().min(1, 'Option text cannot be empty'),
  value: z.string(),
});
export type MultipleChoiceOption = z.infer<typeof MultipleChoiceOptionSchema>;

export const MultipleChoiceSettingsSchema = z.object({
  options: z.array(MultipleChoiceOptionSchema).min(1, 'Must have at least one option'),
  allowOther: z.boolean().default(false),
});
export type MultipleChoiceSettings = z.infer<typeof MultipleChoiceSettingsSchema>;

export const MultipleSelectSettingsSchema = MultipleChoiceSettingsSchema;
export type MultipleSelectSettings = z.infer<typeof MultipleSelectSettingsSchema>;

export const FileUploadSettingsSchema = z.object({
  maxFiles: z.number().min(1).max(10).default(1),
  allowedFileTypes: z.array(z.string()).optional(),
});
export type FileUploadSettings = z.infer<typeof FileUploadSettingsSchema>;

export const RatingSettingsSchema = z.object({
  scale: z.number().min(3).max(10).default(5),
  icon: z.enum(['star', 'heart', 'thumbs', 'numbers']).default('star'),
  lowLabel: z.string().optional(),
  highLabel: z.string().optional(),
});
export type RatingSettings = z.infer<typeof RatingSettingsSchema>;

export const DateTimeSettingsSchema = z.object({
  minDate: z.string().optional(),
  maxDate: z.string().optional(),
});
export type DateTimeSettings = z.infer<typeof DateTimeSettingsSchema>;

export const TimeSettingsSchema = z.object({
  minTime: z.string().optional(),
  maxTime: z.string().optional(),
});
export type TimeSettings = z.infer<typeof TimeSettingsSchema>;

const NoSettingsSchema = z.null().optional();

// --- 4. MASTER SCHEMAS FOR FRONTEND STATE MANAGEMENT ---
const baseQuestionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Question title is required'),
  description: z.string().optional(),
  required: z.boolean().default(false),
  order: z.number().optional(),
});

export const QuestionSchema = z.discriminatedUnion('type', [
  baseQuestionSchema.extend({
    type: z.literal('SHORT_ANSWER'),
    settings: TextSettingsSchema.optional(),
  }),
  baseQuestionSchema.extend({
    type: z.literal('LONG_ANSWER'),
    settings: TextSettingsSchema.optional(),
  }),
  baseQuestionSchema.extend({
    type: z.literal('MULTIPLE_CHOICE'),
    settings: MultipleChoiceSettingsSchema,
  }),
  baseQuestionSchema.extend({
    type: z.literal('MULTIPLE_SELECT'),
    settings: MultipleSelectSettingsSchema,
  }),
  baseQuestionSchema.extend({
    type: z.literal('FILE_UPLOAD'),
    settings: FileUploadSettingsSchema.optional(),
  }),
  baseQuestionSchema.extend({ type: z.literal('RATING'), settings: RatingSettingsSchema }),
  baseQuestionSchema.extend({
    type: z.literal('DATE'),
    settings: DateTimeSettingsSchema.optional(),
  }),
  baseQuestionSchema.extend({ type: z.literal('TIME'), settings: TimeSettingsSchema.optional() }),
  baseQuestionSchema.extend({ type: z.literal('NAME_SELECT'), settings: NoSettingsSchema }),
  baseQuestionSchema.extend({ type: z.literal('NIM_SELECT'), settings: NoSettingsSchema }),
  baseQuestionSchema.extend({ type: z.literal('COURSE_SELECT'), settings: NoSettingsSchema }),
  baseQuestionSchema.extend({ type: z.literal('EVENT_SELECT'), settings: NoSettingsSchema }),
]);

export const formSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['NORMAL', 'HOTLINE', 'MACHINING', 'COMPETITION']).default('NORMAL'),
  isPublished: z.boolean().default(false),
  isActive: z.boolean().default(true),
  allowMultipleSubmissions: z.boolean().default(false),
  requireAuth: z.boolean().default(true),
  showProgressBar: z.boolean().default(true),
  collectEmail: z.boolean().default(true),
  start: z.date().optional(),
  end: z.date().optional(),
  createdBy: z.string().optional(),
});

// For the `form.createQuestion` procedure
export const createQuestionSchema = z.object({
  formId: z.string(),
  title: z.string().min(1, 'Question title is required'),
  description: z.string().optional(),
  type: z.enum(Object.keys(QUESTION_TYPE_CONFIG) as [FormQuestionType, ...FormQuestionType[]]),
  required: z.boolean().default(false),
  order: z.number(),
  settings: z.any().optional(), // Prisma expects a JSON-compatible object for the `settings` field
});

// For the `form.updateQuestion` procedure. Allows partial updates.
export const updateQuestionSchema = createQuestionSchema.omit({ formId: true }).partial().extend({
  id: z.string(), // ID is required to know which question to update
});

// For the `form.submit` procedure. Matches the sparse `FormAnswer` table structure.
const submitAnswerSchema = z.object({
  questionId: z.string(),
  textValue: z.string().optional(),
  numberValue: z.number().optional(),
  dateValue: z.date().optional(),
  jsonValue: z.any().optional(), // For arrays from MULTIPLE_SELECT, etc.
  fileUrl: z.string().url().optional(),
});

export const submitFormSchema = z.object({
  formId: z.string(),
  answers: z.array(submitAnswerSchema),
});

export const formBuilderSchema = formSchema.extend({
  questions: z.array(QuestionSchema),
  creator: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
    })
    .optional(),
});
export type FormBuilderSchema = z.infer<typeof formBuilderSchema>;

export const updateFormNoteSchema = z.object({
  notes: z.string(),
});

export type UpdateFormNoteForm = z.infer<typeof updateFormNoteSchema>;
