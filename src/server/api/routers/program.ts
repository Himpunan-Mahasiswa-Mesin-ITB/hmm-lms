import { TRPCError } from '@trpc/server';
import z from 'zod';

import { createTRPCRouter, bpProcedure } from '~/server/api/trpc';
import { db } from '~/server/db';

export const programRouter = createTRPCRouter({
  getPrograms: bpProcedure.query(async () => {
    return await db.program.findMany({
      include: {
        relatedProfiles: {
          include: {
            profile: true,
          },
        },
        relatedEvents: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                start: true,
                end: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }),
  createProgram: bpProcedure
    .input(
      z.object({
        name: z.string().trim().min(1),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const existing = await db.program.findUnique({
        where: {
          name: input.name,
        },
      });
      if (existing)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'A Program with this name already exists.',
        });
      return await db.program.create({
        data: {
          name: input.name,
          description: input.description,
        },
      });
    }),
  deleteProgram: bpProcedure
    .input(
      z.object({
        programId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await db.program.delete({
          where: {
            id: input.programId,
          },
        });
      } catch (error) {
        console.log('Error deleting program:', error);
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No Program is found.',
        });
      }
    }),
  linkProfileToProgram: bpProcedure
    .input(
      z.object({
        programId: z.string(),
        profileId: z.string(),
        progressToAdd: z.number().int().min(0).max(100),
      }),
    )
    .mutation(async ({ input }) => {
      const existing = await db.programProfileRelation.findUnique({
        where: {
          programId_profileId: {
            programId: input.programId,
            profileId: input.profileId,
          },
        },
      });
      if (existing)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This Profile is already linked with this Program',
        });
      return await db.programProfileRelation.create({
        data: {
          programId: input.programId,
          profileId: input.profileId,
          progressToAdd: input.progressToAdd,
        },
      });
    }),
  updateProgramProfileRelation: bpProcedure
    .input(
      z.object({
        programId: z.string(),
        profileId: z.string(),
        progressToAdd: z.number().int().min(0).max(100),
      }),
    )
    .mutation(async ({ input }) => {
      const existing = await db.programProfileRelation.findUnique({
        where: {
          programId_profileId: {
            programId: input.programId,
            profileId: input.profileId,
          },
        },
      });
      if (!existing)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This Profile linked with this Program is not found',
        });
      return await db.programProfileRelation.update({
        where: {
          programId_profileId: {
            programId: input.programId,
            profileId: input.profileId,
          },
        },
        data: {
          progressToAdd: input.progressToAdd,
        },
      });
    }),
  unlinkProfileFromProgram: bpProcedure
    .input(
      z.object({
        programId: z.string(),
        profileId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const existing = await db.programProfileRelation.findUnique({
        where: {
          programId_profileId: {
            programId: input.programId,
            profileId: input.profileId,
          },
        },
      });
      if (!existing)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This Profile linked with this Program is not found',
        });
      return await db.programProfileRelation.delete({
        where: {
          programId_profileId: {
            programId: input.programId,
            profileId: input.profileId,
          },
        },
      });
    }),
  linkEventToProgram: bpProcedure
    .input(
      z.object({
        programId: z.string(),
        eventId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const existing = await db.programEventRelation.findUnique({
        where: {
          programId_eventId: {
            programId: input.programId,
            eventId: input.eventId,
          },
        },
      });
      if (existing)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This Event is already linked with this Program',
        });
      return await db.programEventRelation.create({
        data: {
          programId: input.programId,
          eventId: input.eventId,
        },
      });
    }),
  unlinkEventFromProgram: bpProcedure
    .input(
      z.object({
        programId: z.string(),
        eventId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const existing = await db.programEventRelation.findUnique({
        where: {
          programId_eventId: {
            programId: input.programId,
            eventId: input.eventId,
          },
        },
      });
      if (!existing)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This Event linked with this Program is not found',
        });
      return await db.programEventRelation.delete({
        where: {
          programId_eventId: {
            programId: input.programId,
            eventId: input.eventId,
          },
        },
      });
    }),
});
