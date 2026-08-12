import { TRPCError } from '@trpc/server';
import z from 'zod';

import { signUpSchema } from '~/lib/schema/auth';
import { hashPassword } from '~/lib/utils';
import { sendVerificationEmail } from '~/server/action/send-verification';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '~/server/api/trpc';
import { db } from '~/server/db';

export const authRouter = createTRPCRouter({
  signUp: publicProcedure.input(signUpSchema).mutation(async ({ input }) => {
    const { name, email, password, nim } = input;

    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Email already registered.',
      });
    }

    if (!email.endsWith('@mahasiswa.itb.ac.id')) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: 'Only ITB student emails are allowed.',
      });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        nim,
        verified: false,
      },
    });

    if (!newUser) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create user. Please try again later.',
      });
    }

    const machining = await db.machining.findFirst();
    const prefix = machining?.currentBatch;

    if (prefix) {
      const isMatchPrefix = email.startsWith(prefix);
      const isMatchDomain = email.endsWith('@mahasiswa.itb.ac.id');
      if (isMatchPrefix && isMatchDomain) {
        console.log(`Match found for ${email}! Executing action...`);
        await db.user.update({
          where: {
            id: newUser.id,
          },
          data: {
            role: 'MACHINING',
          },
        });
      } else {
        console.log(`${email} did not match the pattern. Continuing...`);
      }
    }

    return {
      success: true,
      message: 'Registration successful. Please check your email for verification link.',
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
    };
  }),

  resetPasswordByAdmin: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== 'SUPERADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not allowed' });
      }

      const user = await db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found.',
        });
      }

      const newPassword = 'TempPass123';
      const hashedPassword = await hashPassword(newPassword);

      await db.user.update({
        where: { id: input.userId },
        data: { password: hashedPassword },
      });

      return {
        success: true,
        newPassword,
      };
    }),
  hashPasswordByAdmin: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== 'SUPERADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not allowed' });
      }

      const user = await db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found.',
        });
      }

      const IS_BCRYPT_HASH = /^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$/;

      if (user.password && IS_BCRYPT_HASH.test(user.password)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Password already hashed.",
        })
      }

      const hashedPassword = await hashPassword(user.password);

      await db.user.update({
        where: { id: input.userId },
        data: { password: hashedPassword },
      });

      return {
        success: true,
      };
    }),

  resendVerificationEmail: publicProcedure
    .input(z.object({ email: z.string() }))
    .mutation(async ({ input }) => {
      const existingUser = await db.user.findUnique({
        where: { email: input.email },
      });

      if (!existingUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'UserNotFound',
        });
      }

      if (existingUser.emailVerified || existingUser.verified) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'AlreadyVerified',
        });
      }

      await sendVerificationEmail(input.email, existingUser.name);

      return { success: true, email: input.email, name: existingUser.name };
    }),

  resetPassword: publicProcedure
    .input(z.object({ token: z.string(), password: z.string() }))
    .mutation(async ({ input }) => {
      const resetToken = await db.passwordResetToken.findUnique({
        where: { token: input.token },
      });

      if (!resetToken) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid reset token',
        });
      }

      if (resetToken.expiresAt < new Date()) {
        await db.passwordResetToken.delete({
          where: { id: resetToken.id },
        });
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Reset token has expired',
        });
      }

      const hashedPassword = await hashPassword(input.password);

      await db.$transaction([
        db.user.update({
          where: { email: resetToken.email },
          data: { password: hashedPassword },
        }),
        db.passwordResetToken.delete({
          where: { id: resetToken.id },
        }),
      ]);

      return { success: true };
    }),

  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const existingToken = await db.verificationToken.findUnique({
        where: { token: input.token },
      });

      if (!existingToken) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'InvalidToken',
        });
      }

      if (existingToken.expiresAt < new Date()) {
        await db.verificationToken.delete({
          where: { id: existingToken.id },
        });
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'TokenExpired',
        });
      }

      await db.$transaction([
        db.user.update({
          where: { email: existingToken.email },
          data: { emailVerified: new Date(), verified: true },
        }),
        db.verificationToken.delete({
          where: { id: existingToken.id },
        }),
      ]);

      return { success: true };
    }),
});
