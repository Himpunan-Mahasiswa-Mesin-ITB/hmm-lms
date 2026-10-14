import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';

import { editProfileSchema } from '~/lib/schema/profile';
import {
  userIdSchema,
  updateUserRoleSchema,
  updateUserSchema,
  deleteUserSchema,
  getUsersSchema,
} from '~/lib/schema/user';
import {
  createTRPCRouter,
  adminProcedure,
  protectedProcedure,
  superAdminProcedure,
} from '~/server/api/trpc';

export const userRouter = createTRPCRouter({
  getAll: adminProcedure.input(getUsersSchema).query(async ({ ctx, input }) => {
    const { page, limit, search, role, faculty } = input;
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { nim: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(role && { role }),
      ...(faculty && {
        faculty: { contains: faculty, mode: 'insensitive' as const },
      }),
    };

    const [users, total] = await Promise.all([
      ctx.db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              courses: true,
              userAttempts: true,
              learningSessions: true,
            },
          },
        },
      }),
      ctx.db.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }),

  getById: adminProcedure.input(userIdSchema).query(async ({ ctx, input }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: input.id },
      include: {
        courses: {
          select: {
            id: true,
            title: true,
            classCode: true,
          },
        },
        userAttempts: {
          select: {
            id: true,
            score: true,
            maxScore: true,
            isCompleted: true,
            startedAt: true,
            tryout: {
              select: {
                title: true,
                course: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
          orderBy: { startedAt: 'desc' },
          take: 10,
        },
        learningSessions: {
          select: {
            id: true,
            date: true,
            duration: true,
            course: {
              select: {
                title: true,
              },
            },
          },
          orderBy: { date: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            courses: true,
            userAttempts: true,
            learningSessions: true,
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found.',
      });
    }

    return user;
  }),

  updateRole: adminProcedure.input(updateUserRoleSchema).mutation(async ({ ctx, input }) => {
    // Prevent admin from changing their own role
    if (input.id === ctx.session.user.id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You cannot change your own role.',
      });
    }

    return ctx.db.user.update({
      where: { id: input.id },
      data: { role: input.role },
    });
  }),

  update: adminProcedure.input(updateUserSchema).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;

    return ctx.db.user.update({
      where: { id },
      data,
    });
  }),

  delete: adminProcedure.input(deleteUserSchema).mutation(async ({ ctx, input }) => {
    // Prevent admin from deleting themselves
    if (input.id === ctx.session.user.id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You cannot delete your own account.',
      });
    }

    return ctx.db.user.delete({
      where: { id: input.id },
    });
  }),

  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const { session, db } = ctx;

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        nim: true,
        faculty: true,
        program: true,
        position: true,
        role: true,
        image: true,
        coverImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }),

  updateProfile: protectedProcedure.input(editProfileSchema).mutation(async ({ ctx, input }) => {
    const { session, db } = ctx;

    // Validate user exists
    const existingUser = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!existingUser) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found.',
      });
    }

    // Prepare update data
    const updateData: {
      name: string;
      position?: string | null;
      image?: string | null;
      coverImage?: string | null;
      password?: string;
    } = {
      name: input.name,
      position: input.position && input.position.trim() !== '' ? input.position : null,
      image: input.image && input.image.trim() !== '' ? input.image : null,
      coverImage: input.coverImage && input.coverImage.trim() !== '' ? input.coverImage : null,
    };

    // Handle password change if newPassword is provided
    if (input.newPassword && input.newPassword.trim().length > 0) {
      // Verify current password
      const isPasswordValid = await bcrypt.compare(
        input.currentPassword ?? '',
        existingUser.password,
      );

      if (!isPasswordValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Current password is incorrect.',
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(input.newPassword, 10);
      updateData.password = hashedPassword;
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        nim: true,
        faculty: true,
        program: true,
        position: true,
        role: true,
        image: true,
        coverImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }),

  getFaculties: adminProcedure.query(async ({ ctx }) => {
    const faculties = await ctx.db.user.findMany({
      select: { faculty: true },
      where: { faculty: { not: null } },
      distinct: ['faculty'],
    });

    return faculties
      .map((f) => f.faculty)
      .filter(Boolean)
      .sort();
  }),

  bulkConvertMachiningToStudent: superAdminProcedure.mutation(async ({ ctx }) => {
    const machiningUsers = await ctx.db.user.findMany({
      where: { role: 'MACHINING' },
      select: { id: true, name: true, email: true },
    });

    if (machiningUsers.length === 0) {
      return {
        success: true,
        message: 'No users with MACHINING role found',
        count: 0,
        users: [],
      };
    }

    const result = await ctx.db.user.updateMany({
      where: { role: 'MACHINING' },
      data: { role: 'STUDENT' },
    });

    return {
      success: true,
      message: `Successfully converted ${result.count} users from MACHINING to STUDENT role`,
      count: result.count,
      users: machiningUsers,
    };
  }),

  bulkRevokeBPUsers: superAdminProcedure.mutation(async ({ ctx }) => {
    const bpUsers = await ctx.db.user.findMany({
      where: { role: 'BP' },
      select: { id: true, name: true, email: true },
    });

    if (bpUsers.length === 0) {
      return {
        success: true,
        message: 'No users with BP role found',
        count: 0,
        users: [],
      };
    }

    const result = await ctx.db.user.updateMany({
      where: { role: 'BP' },
      data: { role: 'STUDENT' },
    });

    return {
      success: true,
      message: `Successfully revoked role from ${result.count} users with BP role`,
      count: result.count,
      users: bpUsers,
    };
  }),
});
