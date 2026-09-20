import { TRPCError } from '@trpc/server';
import z from 'zod';

import { createTRPCRouter, bpProcedure, protectedProcedure } from '~/server/api/trpc';
import { db } from '~/server/db';

export const profileRouter = createTRPCRouter({
  createGroupProfile: bpProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      if (!input)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Input data is required.',
        });

      await db.groupProfile.create({
        data: {
          name: input.name,
          description: input.description,
        },
      });
    }),
  createProfile: bpProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      if (!input)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Input data is required.',
        });

      await db.profile.create({
        data: {
          name: input.name,
          description: input.description,
        },
      });
    }),
  updateGroupProfile: bpProcedure
    .input(
      z.object({
        groupId: z.string(),
        name: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      if (!input)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Input data is required.',
        });

      const existingGroup = await db.groupProfile.findUnique({
        where: {
          id: input.groupId,
        },
      });

      if (!existingGroup)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No Group Profile is found.',
        });

      await db.groupProfile.update({
        where: {
          id: input.groupId,
        },
        data: {
          name: input.name,
          description: input.description,
        },
      });
    }),
  updateProfile: bpProcedure
    .input(
      z.object({
        profileId: z.string(),
        name: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      if (!input)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Input data is required.',
        });

      const existingProfile = await db.profile.findUnique({
        where: {
          id: input.profileId,
        },
      });

      if (!existingProfile)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No Profile is found.',
        });

      await db.profile.update({
        where: {
          id: input.profileId,
        },
        data: {
          name: input.name,
          description: input.description,
        },
      });
    }),
  deleteGroupProfile: bpProcedure
    .input(
      z.object({
        groupId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      if (!input)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Input data is required.',
        });

      const existingGroup = await db.groupProfile.findUnique({
        where: {
          id: input.groupId,
        },
      });

      if (!existingGroup)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No Group Profile is found.',
        });

      await db.groupProfile.delete({
        where: {
          id: input.groupId,
        },
      });
    }),
  deleteProfile: bpProcedure
    .input(
      z.object({
        profileId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      if (!input)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Input data is required.',
        });

      const existingProfile = await db.profile.findUnique({
        where: {
          id: input.profileId,
        },
      });

      if (!existingProfile)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No Profile is found.',
        });

      await db.profile.delete({
        where: {
          id: input.profileId,
        },
      });
    }),
  linkProfileToGroup: bpProcedure
    .input(
      z.object({
        profileId: z.string(),
        groupId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await db.profile.update({
          where: {
            id: input.profileId,
          },
          data: {
            groupId: input.groupId,
          },
        });
      } catch (error) {
        console.log('Error linking profile to group:', error);
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No Profile record found.',
        });
      }
    }),
  unlinkProfileFromGroup: bpProcedure
    .input(
      z.object({
        profileId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await db.profile.update({
          where: {
            id: input.profileId,
          },
          data: {
            groupId: null,
          },
        });
      } catch (error) {
        console.log('Error unlinking profile from group:', error);
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No Profile record found.',
        });
      }
    }),
  createProfileProgress: bpProcedure
    .input(
      z.object({
        profileId: z.string(),
        userId: z.string(),
        progress: z.number().min(0).max(100).optional().default(0),
      }),
    )
    .mutation(async ({ input }) => {
      return await db.userProfileProgress.upsert({
        where: {
          userId_profileId: {
            userId: input.userId,
            profileId: input.profileId,
          },
        },
        create: {
          userId: input.userId,
          profileId: input.profileId,
          progress: input.progress,
        },
        update: {},
      });
    }),
  updateProfileProgress: bpProcedure
    .input(
      z.object({
        profileId: z.string(),
        userId: z.string(),
        progress: z.number().min(0).max(100),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await db.userProfileProgress.update({
          where: {
            userId_profileId: {
              userId: input.userId,
              profileId: input.profileId,
            },
          },
          data: {
            progress: input.progress,
          },
        });
      } catch (error) {
        console.log('Error updating profile progress:', error);
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No Profile record found for this user.',
        });
      }
    }),
  deleteProfileProgress: bpProcedure
    .input(
      z.object({
        profileId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await db.userProfileProgress.delete({
          where: {
            userId_profileId: {
              userId: input.userId,
              profileId: input.profileId,
            },
          },
        });
      } catch (error) {
        console.log('Error deleting profile progress:', error);
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No Profile record found for this user.',
        });
      }
    }),
  createGroupProfileMembership: bpProcedure
    .input(
      z.object({
        groupProfileId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return await db.userGroupProfile.upsert({
        where: {
          userId_groupProfileId: {
            userId: input.userId,
            groupProfileId: input.groupProfileId,
          },
        },
        create: {
          userId: input.userId,
          groupProfileId: input.groupProfileId,
        },
        update: {},
      });
    }),

  deleteGroupProfileMembership: bpProcedure
    .input(
      z.object({
        groupProfileId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await db.userGroupProfile.delete({
          where: {
            userId_groupProfileId: {
              userId: input.userId,
              groupProfileId: input.groupProfileId,
            },
          },
        });
      } catch (error) {
        console.log('Error deleting group profile membership:', error);
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User is not a member of this Group Profile.',
        });
      }
    }),
  getProfileMembership: protectedProcedure
    .input(
      z.object({
        profileId: z.string(),
        userId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const profileMember = await db.userProfileProgress.findUnique({
        where: {
          userId_profileId: {
            userId: input.userId,
            profileId: input.profileId,
          },
        },
        include: {
          profile: true,
        },
      });

      if (!profileMember) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Group Profile membership not found.',
        });
      }

      return profileMember;
    }),
  getGroupProfileMembership: protectedProcedure
    .input(
      z.object({
        groupProfileId: z.string(),
        userId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const membership = await db.userGroupProfile.findUnique({
        where: {
          userId_groupProfileId: {
            userId: input.userId,
            groupProfileId: input.groupProfileId,
          },
        },
        include: {
          groupProfile: {
            include: {
              profiles: true,
            },
          },
        },
      });

      if (!membership) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Group Profile membership not found.',
        });
      }

      return membership;
    }),
  getProfiles: bpProcedure.query(async () => {
    return await db.profile.findMany({
      include: {
        group: true,
        userProgresses: true,
      },
    });
  }),
  getGroupProfiles: bpProcedure.query(async () => {
    return await db.groupProfile.findMany({
      include: {
        profiles: true,
        userMemberships: true,
      },
    });
  }),
  getUserProfiles: bpProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return await db.userProfileProgress.findMany({
        where: {
          userId: input.userId,
        },
        include: {
          profile: true,
        },
      });
    }),
  getUserGroupProfiles: bpProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return await db.userGroupProfile.findMany({
        where: {
          userId: input.userId,
        },
        include: {
          groupProfile: {
            include: {
              profiles: true,
            },
          },
        },
      });
    }),
  getAllUsers: bpProcedure.query(async () => {
    return await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        nim: true,
        role: true,
      },
    });
  }),
  getCurrentUserProfileProgress: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const userGroupProfiles = await db.userGroupProfile.findMany({
      where: { userId },
      include: {
        groupProfile: {
          include: {
            profiles: true,
          },
        },
      },
    });

    const userProfileProgress = await db.userProfileProgress.findMany({
      where: { userId },
      include: {
        profile: {
          include: {
            group: true,
          },
        },
      },
    });

    const groupedProgress = userGroupProfiles.map((membership) => {
      const groupProfile = membership.groupProfile;
      const profileProgresses = userProfileProgress.filter(
        (progress) => progress.profile.groupId === groupProfile.id,
      );

      return {
        groupProfile: {
          id: groupProfile.id,
          name: groupProfile.name,
          description: groupProfile.description,
        },
        profiles: groupProfile.profiles.map((profile) => {
          const progress = profileProgresses.find((p) => p.profileId === profile.id);
          return {
            id: profile.id,
            name: profile.name,
            description: profile.description,
            progress: progress?.progress || 0,
            updatedAt: progress?.updatedAt || null,
          };
        }),
      };
    });

    const standaloneProfiles = userProfileProgress.filter((progress) => !progress.profile.groupId);

    if (standaloneProfiles.length > 0) {
      groupedProgress.push({
        groupProfile: {
          id: 'standalone',
          name: 'Standalone Profiles',
          description: 'Profiles not assigned to any group',
        },
        profiles: standaloneProfiles.map((progress) => ({
          id: progress.profile.id,
          name: progress.profile.name,
          description: progress.profile.description,
          progress: progress.progress,
          updatedAt: progress.updatedAt,
        })),
      });
    }

    return groupedProgress;
  }),
});
