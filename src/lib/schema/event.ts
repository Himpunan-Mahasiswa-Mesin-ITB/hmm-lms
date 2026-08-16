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

export const eventRSVPResponseMachiningSchema = z
  .object({
    rsvpStatus: z.enum(['YES', 'PERMIT', 'NO', 'MAYBE']),
    idLine: z.string().optional(),
    reason: z.string().optional(),
    // allow valid URL or empty string
    proofUrl: z.string().url('Link tidak valid').or(z.literal('')).optional(),
    leavingTime: z.date().optional(),
    catchingUpTime: z.date().optional(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.rsvpStatus === 'NO') {
      if (!data.idLine || data.idLine.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'ID Line wajib diisi',
          path: ['idLine'],
        });
      }
      if (!data.reason || data.reason.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Alasan tidak hadir wajib diisi',
          path: ['reason'],
        });
      }
      if (!data.proofUrl || data.proofUrl.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Bukti tidak hadir wajib diisi',
          path: ['proofUrl'],
        });
      }
    } else if (data.rsvpStatus === 'PERMIT') {
      if (!data.idLine || data.idLine.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'ID Line wajib diisi',
          path: ['idLine'],
        });
      }
      if (!data.reason || data.reason.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Alasan izin wajib diisi',
          path: ['reason'],
        });
      }
      if (!data.proofUrl || data.proofUrl.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Bukti izin wajib diisi',
          path: ['proofUrl'],
        });
      }

      if (!data.leavingTime && !data.catchingUpTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Wajib mengisi waktu meninggalkan atau waktu menyusul',
          path: ['leavingTime'],
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Wajib mengisi waktu meninggalkan atau waktu menyusul',
          path: ['catchingUpTime'],
        });
      }
    }
  });

export type EventRSVPResponseMachining = z.infer<typeof eventRSVPResponseMachiningSchema>;

export const updateNoteSchema = z.object({
  notes: z.string(),
});

export type UpdateNoteForm = z.infer<typeof updateNoteSchema>;
