import {
  Role,
  EventMode,
  RSVPStatus,
  ApprovalStatus,
  PresenceStatus,
  EventScope,
} from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { eventInputSchema } from '~/lib/schema/event';
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  adminProcedure,
} from '~/server/api/trpc';

const rsvpStatusSchema = z.nativeEnum(RSVPStatus);
const approvalStatusSchema = z.nativeEnum(ApprovalStatus);
const presenceStatusSchema = z.nativeEnum(PresenceStatus);

export const eventRouter = createTRPCRouter({
  createDraft: adminProcedure.mutation(async ({ ctx }) => {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const data = await ctx.db.event.create({
      data: {
        title: 'Untitled Event',
        description: '',
        start: now,
        end: oneHourLater,
        allDay: false,
        createdById: ctx.session.user.id,
        eventMode: EventMode.BASIC,
        hideEventTime: false,
      },
    });

    return data;
  }),

  getMyEvents: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.event.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
        course: {
          select: { title: true, classCode: true },
        },
      },
      orderBy: { start: 'desc' },
    });
  }),

  getCourseEvents: protectedProcedure.query(async ({ ctx }) => {
    const userCourses = await ctx.db.course.findMany({
      where: {
        members: {
          some: { id: ctx.session.user.id },
        },
      },
      select: { id: true },
    });
    const courseIds = userCourses.map((course) => course.id);
    return ctx.db.event.findMany({
      where: {
        courseId: { in: courseIds },
      },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
        course: {
          select: { title: true, classCode: true },
        },
      },
      orderBy: { start: 'desc' },
    });
  }),

  getAllEvents: protectedProcedure.query(async ({ ctx }) => {
    const userCourses = await ctx.db.course.findMany({
      where: {
        members: {
          some: { id: ctx.session.user.id },
        },
      },
      select: { id: true },
    });
    const courseIds = userCourses.map((course) => course.id);
    return ctx.db.event.findMany({
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
        course: {
          select: { title: true, classCode: true },
        },
      },
      orderBy: { start: 'desc' },
    });
  }),
  getNonMachiningEvents: protectedProcedure.query(async ({ ctx }) => {
    const userCourses = await ctx.db.course.findMany({
      where: {
        members: {
          some: { id: ctx.session.user.id },
        },
      },
      select: { id: true },
    });
    const courseIds = userCourses.map((course) => course.id);
    return ctx.db.event.findMany({
      where: {
        NOT: {
          scope: 'MACHINING',
        },
      },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
        course: {
          select: { title: true, classCode: true },
        },
      },
      orderBy: { start: 'desc' },
    });
  }),
  getMachiningEvents: protectedProcedure.query(async ({ ctx }) => {
    const userCourses = await ctx.db.course.findMany({
      where: {
        members: {
          some: { id: ctx.session.user.id },
        },
      },
      select: { id: true },
    });
    const courseIds = userCourses.map((course) => course.id);
    return ctx.db.event.findMany({
      where: {
        scope: 'MACHINING',
      },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
        course: {
          select: { title: true, classCode: true },
        },
      },
      orderBy: { start: 'desc' },
    });
  }),
  getEventById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.db.event.findUnique({
        where: { id: input.id },
        include: {
          createdBy: { select: { name: true, image: true } },
          course: { select: { title: true, classCode: true } },
          _count: {
            select: {
              rsvpResponses: {
                where: { status: 'YES', approvalStatus: 'APPROVED' },
              },
              presenceRecords: { where: { status: 'PRESENT' } },
            },
          },
        },
      });

      if (!event) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      let userRsvp: Awaited<ReturnType<typeof ctx.db.eventRSVPResponse.findFirst>> | null = null;
      let userPresence: Awaited<ReturnType<typeof ctx.db.eventPresence.findFirst>> | null = null;

      if (ctx.session?.user) {
        userRsvp = await ctx.db.eventRSVPResponse.findFirst({
          where: { eventId: input.id, userId: ctx.session.user.id },
        });
        userPresence = await ctx.db.eventPresence.findFirst({
          where: { eventId: input.id, userId: ctx.session.user.id },
        });
      }

      return { ...event, userRsvp, userPresence };
    }),

  getEventManagementData: adminProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [rsvpResponses, presenceRecords] = await Promise.all([
        ctx.db.eventRSVPResponse.findMany({
          where: { eventId: input.eventId },
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true, nim: true },
            },
          },
          orderBy: { respondedAt: 'desc' },
        }),
        ctx.db.eventPresence.findMany({
          where: { eventId: input.eventId },
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true, nim: true },
            },
            approver: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
      ]);
      return { rsvpResponses, presenceRecords };
    }),

  getAllEventsAdmin: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== 'ADMIN' && ctx.session.user.role !== 'SUPERADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const { limit, cursor } = input;

      const items = await ctx.db.event.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: [{ start: 'desc' }, { createdAt: 'desc' }],
        include: {
          course: {
            select: {
              title: true,
              classCode: true,
            },
          },
          user: {
            select: {
              name: true,
            },
          },
          createdBy: {
            select: {
              name: true,
            },
          },
          // ADD THIS _count field
          _count: {
            select: {
              rsvpResponses: true,
              presenceRecords: true,
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  createEvent: protectedProcedure.input(eventInputSchema).mutation(async ({ ctx, input }) => {
    if (
      input.scope !== 'personal' &&
      ctx.session.user.role !== Role.ADMIN &&
      ctx.session.user.role !== Role.SUPERADMIN
    ) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only admins can create course or global events',
      });
    }
    if (input.end <= input.start) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'End time must be after start time',
      });
    }

    const { scope, courseId, ...eventData } = input;

    const data = {
      ...eventData,
      createdById: ctx.session.user.id,
      userId: scope === 'personal' ? ctx.session.user.id : null,
      courseId: scope === 'course' ? courseId : null,
      scope: scope.toUpperCase() as EventScope,
      timeline: input.hasTimeline && input.timeline ? input.timeline : undefined,
    };

    return ctx.db.event.create({ data });
  }),

  updateEvent: adminProcedure
    .input(eventInputSchema.partial().extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, scope, courseId, ...updateData } = input;

      const existingEvent = await ctx.db.event.findUnique({ where: { id } });
      if (!existingEvent) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' });
      }

      const eventUpdateData: Record<string, unknown> = { ...updateData };

      if (scope) {
        eventUpdateData.userId = scope === 'personal' ? ctx.session.user.id : null;
        eventUpdateData.courseId = scope === 'course' ? courseId : null;
      }

      return ctx.db.event.update({
        where: { id },
        data: {
          ...eventUpdateData,
          scope: scope?.toUpperCase() as EventScope,
        },
      });
    }),

  deleteEvent: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const event = await ctx.db.event.findUnique({ where: { id: input.id } });
      if (!event) throw new TRPCError({ code: 'NOT_FOUND' });

      return ctx.db.event.delete({ where: { id: input.id } });
    }),

  respondToRsvp: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        status: rsvpStatusSchema,
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const event = await ctx.db.event.findUnique({
        where: { id: input.eventId },
      });

      if (!event) throw new TRPCError({ code: 'NOT_FOUND' });

      // Check if RSVP deadline has passed
      if (event.rsvpDeadline && new Date() > event.rsvpDeadline) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'RSVP deadline has passed',
        });
      }

      return ctx.db.eventRSVPResponse.upsert({
        where: {
          eventId_userId: {
            eventId: input.eventId,
            userId: ctx.session.user.id,
          },
        },
        update: {
          status: input.status,
          respondedAt: new Date(),
          approvalStatus: ApprovalStatus.APPROVED, // Auto-approve
          notes: input.notes,
        },
        create: {
          eventId: input.eventId,
          userId: ctx.session.user.id,
          status: input.status,
          approvalStatus: ApprovalStatus.APPROVED, // Auto-approve
          notes: input.notes,
        },
      });
    }),

  // Replace recordPresence mutation
  recordPresence: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const event = await ctx.db.event.findUnique({
        where: { id: input.eventId },
      });

      if (!event) throw new TRPCError({ code: 'NOT_FOUND' });

      const now = new Date();

      // Allow check-in from 60 minutes before until event ends
      const allowedStartTime = new Date(event.start.getTime() - 60 * 60 * 1000);

      if (now < allowedStartTime || now > event.end) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Check-in is not available at this time',
        });
      }

      const existingPresence = await ctx.db.eventPresence.findFirst({
        where: { eventId: input.eventId, userId: ctx.session.user.id },
      });

      if (existingPresence) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You have already checked in',
        });
      }

      // Determine if user is late
      const isLate = now > event.start;

      return ctx.db.eventPresence.create({
        data: {
          eventId: input.eventId,
          userId: ctx.session.user.id,
          status: isLate ? PresenceStatus.LATE : PresenceStatus.PRESENT,
          checkedInAt: new Date(),
          isLate,
        },
      });
    }),

  updateRsvpApproval: adminProcedure
    .input(z.object({ responseId: z.string(), status: approvalStatusSchema }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.eventRSVPResponse.update({
        where: { id: input.responseId },
        data: {
          approvalStatus: input.status,
          approvedBy: ctx.session.user.id,
          approvedAt: new Date(),
        },
      });
    }),

  updateRSVPStatus: adminProcedure
    .input(z.object({ responseId: z.string(), status: rsvpStatusSchema }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.eventRSVPResponse.update({
        where: { id: input.responseId },
        data: {
          status: input.status,
          approvedBy: ctx.session.user.id,
          approvedAt: new Date(),
        },
      });
    }),

  updatePresenceStatus: adminProcedure
    .input(z.object({ presenceId: z.string(), status: presenceStatusSchema }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.eventPresence.update({
        where: { id: input.presenceId },
        data: {
          status: input.status,
          approvedBy: ctx.session.user.id,
          approvedAt: new Date(),
        },
      });
    }),

  updatePresenceNote: adminProcedure
    .input(
      z.object({ presenceId: z.string(), notes: z.string(), type: z.enum(['rsvp', 'attendance']) }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.type === 'attendance') {
        return ctx.db.eventPresence.update({
          where: { id: input.presenceId },
          data: {
            notes: input.notes,
          },
        });
      } else {
        return ctx.db.eventRSVPResponse.update({
          where: { id: input.presenceId },
          data: {
            notes: input.notes,
          },
        });
      }
    }),

  approveAllRsvps: adminProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.eventRSVPResponse.updateMany({
        where: {
          eventId: input.eventId,
          approvalStatus: ApprovalStatus.PENDING,
        },
        data: {
          approvalStatus: ApprovalStatus.APPROVED,
          approvedBy: ctx.session.user.id,
          approvedAt: new Date(),
        },
      });
    }),

  approveAllAttendances: adminProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.eventPresence.updateMany({
        where: {
          eventId: input.eventId,
          status: PresenceStatus.PENDING_APPROVAL,
        },
        data: {
          status: PresenceStatus.PRESENT,
          approvedBy: ctx.session.user.id,
          approvedAt: new Date(),
        },
      });
    }),
});
