// Shared enum types extracted from Prisma schema
// These are safe to import in client components

export type Role = 'MACHINING' | 'STUDENT' | 'BP' | 'ADMIN' | 'SUPERADMIN';
export type ResourceType = 'FILE' | 'LINK';
export type ResourceCategory = 'E_BOOK' | 'PRESENTATION' | 'NOTES' | 'PROBLEMS' | 'VIDEO' | 'SYLLABUS' | 'OTHER';
export type AttachableType = 'COURSE' | 'ANNOUNCEMENT' | 'EVENT' | 'JOB_VACANCY' | 'SCHOLARSHIP';
export type LinkSource = 'YOUTUBE' | 'GOOGLE_DRIVE';
export type QuestionType = 'MULTIPLE_CHOICE_SINGLE' | 'MULTIPLE_CHOICE_MULTIPLE' | 'SHORT_ANSWER' | 'LONG_ANSWER';
export type ScholarshipType = 'INTERNAL' | 'EXTERNAL';
export type AnnouncementScope = 'GLOBAL' | 'COURSE' | 'MACHINING';
export type EventColor = 'SKY' | 'AMBER' | 'VIOLET' | 'ROSE' | 'EMERALD' | 'ORANGE';
export type EventMode = 'BASIC' | 'RSVP_ONLY' | 'ATTENDANCE_ONLY' | 'RSVP_AND_ATTENDANCE';
export type RSVPStatus = 'YES' | 'PERMIT' | 'NO' | 'MAYBE';
export type PresenceStatus = 'ABSENT' | 'PRESENT' | 'LATE' | 'EXCUSED' | 'PENDING_APPROVAL' | 'REJECTED';

// Enum objects for runtime use
export const Role = {
  MACHINING: 'MACHINING' as const,
  STUDENT: 'STUDENT' as const,
  BP: 'BP' as const,
  ADMIN: 'ADMIN' as const,
  SUPERADMIN: 'SUPERADMIN' as const,
} as const;

export const ResourceType = {
  FILE: 'FILE' as const,
  LINK: 'LINK' as const,
} as const;

export const ResourceCategory = {
  E_BOOK: 'E_BOOK' as const,
  PRESENTATION: 'PRESENTATION' as const,
  NOTES: 'NOTES' as const,
  PROBLEMS: 'PROBLEMS' as const,
  VIDEO: 'VIDEO' as const,
  SYLLABUS: 'SYLLABUS' as const,
  OTHER: 'OTHER' as const,
} as const;

export const AttachableType = {
  COURSE: 'COURSE' as const,
  ANNOUNCEMENT: 'ANNOUNCEMENT' as const,
  EVENT: 'EVENT' as const,
  JOB_VACANCY: 'JOB_VACANCY' as const,
  SCHOLARSHIP: 'SCHOLARSHIP' as const,
} as const;

export const LinkSource = {
  YOUTUBE: 'YOUTUBE' as const,
  GOOGLE_DRIVE: 'GOOGLE_DRIVE' as const,
} as const;

export const QuestionType = {
  MULTIPLE_CHOICE_SINGLE: 'MULTIPLE_CHOICE_SINGLE' as const,
  MULTIPLE_CHOICE_MULTIPLE: 'MULTIPLE_CHOICE_MULTIPLE' as const,
  SHORT_ANSWER: 'SHORT_ANSWER' as const,
  LONG_ANSWER: 'LONG_ANSWER' as const,
} as const;

export const ScholarshipType = {
  INTERNAL: 'INTERNAL' as const,
  EXTERNAL: 'EXTERNAL' as const,
} as const;

export const AnnouncementScope = {
  GLOBAL: 'GLOBAL' as const,
  COURSE: 'COURSE' as const,
  MACHINING: 'MACHINING' as const,
} as const;

export const EventColor = {
  SKY: 'SKY' as const,
  AMBER: 'AMBER' as const,
  VIOLET: 'VIOLET' as const,
  ROSE: 'ROSE' as const,
  EMERALD: 'EMERALD' as const,
  ORANGE: 'ORANGE' as const,
} as const;

export const EventMode = {
  BASIC: 'BASIC' as const,
  RSVP_ONLY: 'RSVP_ONLY' as const,
  ATTENDANCE_ONLY: 'ATTENDANCE_ONLY' as const,
  RSVP_AND_ATTENDANCE: 'RSVP_AND_ATTENDANCE' as const,
} as const;

export const RSVPStatus = {
  YES: 'YES' as const,
  PERMIT: 'PERMIT' as const,
  NO: 'NO' as const,
  MAYBE: 'MAYBE' as const,
} as const;

export const PresenceStatus = {
  ABSENT: 'ABSENT' as const,
  PRESENT: 'PRESENT' as const,
  LATE: 'LATE' as const,
  EXCUSED: 'EXCUSED' as const,
  PENDING_APPROVAL: 'PENDING_APPROVAL' as const,
  REJECTED: 'REJECTED' as const,
} as const;
