// Prisma enum types for use in client components
// This file duplicates Prisma enums to avoid importing @prisma/client in client code

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum PresenceStatus {
  PRESENT = 'PRESENT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
  REJECTED = 'REJECTED',
}

export enum RSVPStatus {
  YES = 'YES',
  PERMIT = 'PERMIT',
  NO = 'NO',
  MAYBE = 'MAYBE',
}

export enum Role {
  STUDENT = 'STUDENT',
  MACHINING = 'MACHINING',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
}

export enum EventMode {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  HYBRID = 'HYBRID',
}
