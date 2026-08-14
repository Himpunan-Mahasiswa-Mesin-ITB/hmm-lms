import { EventMode } from '@prisma/client';
import z from 'zod';

export const timelineItemSchema = z.object({
  time: z.string(),
  title: z.string(),
  description: z.string().optional(),
  isCompleted: z.boolean().optional().default(false),
});

export const eventInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  start: z.date(),
  end: z.date(),
  hideEventTime: z.boolean().default(false),
  allDay: z.boolean().default(false),
  location: z.string().optional(),
  hasTimeline: z.boolean().default(false),
  timeline: z.array(timelineItemSchema).optional(),
  scope: z.enum(['personal', 'course', 'global', 'machining']),
  courseId: z.string().optional(),
  eventMode: z.nativeEnum(EventMode).default(EventMode.ATTENDANCE_ONLY),
  rsvpDeadline: z.date().optional().nullable(),
  rsvpRequiresApproval: z.boolean().default(false),
  presenceRequiresApproval: z.boolean().default(false),
});

export const updateNoteSchema = z.object({
  notes: z.string(),
});

export type UpdateNoteForm = z.infer<typeof updateNoteSchema>;
