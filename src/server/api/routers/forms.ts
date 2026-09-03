import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import {
  formSchema,
  createQuestionSchema,
  updateQuestionSchema,
  submitFormSchema,
  updateFormNoteSchema,
} from '~/lib/types/forms';

import { adminProcedure, createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

export const formRouter = createTRPCRouter({
  // form manager management

  // mutation for edit mode
  addManager: protectedProcedure
    .input(z.object({ formId: z.string(), managerId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const form = await ctx.db.form.findUnique({
        where: { id: input.formId },
        select: { createdBy: true },
      });

      if (
        (!form || form.createdBy !== ctx.session.user.id) &&
        ctx.session.user.role !== 'SUPERADMIN'
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only add managers to your own forms',
        });
      }

      const userToAdd = await ctx.db.user.findUnique({
        where: { id: input.managerId },
        select: { role: true },
      });

      if (!userToAdd) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      if (userToAdd.role !== 'ADMIN' && userToAdd.role !== 'SUPERADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only users with ADMIN or SUPERADMIN role can be added as managers',
        });
      }

      return ctx.db.form.update({
        where: { id: input.formId },
        data: {
          managers: {
            connect: { id: input.managerId },
          },
        },
        include: {
          managers: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });
    }),
  // mutation for create mode
  addManagers: protectedProcedure
    .input(z.object({ formId: z.string(), managerIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const form = await ctx.db.form.findUnique({
        where: { id: input.formId },
        select: { createdBy: true },
      });

      if (!form || form.createdBy !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only add managers to your own forms',
        });
      }

      const usersToAdd = await ctx.db.user.findMany({
        where: { id: { in: input.managerIds } },
        select: { id: true, role: true },
      });

      if (usersToAdd.length !== input.managerIds.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'One or more admin users were not found',
        });
      }

      const validManagers = usersToAdd
        .filter((user) => user.role === 'ADMIN' || user.role === 'SUPERADMIN')
        .map((user) => user.id);
      const hasInvalidManagers = usersToAdd.some((user) => !validManagers.includes(user.id));

      if (hasInvalidManagers) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only users with ADMIN or SUPERADMIN role can be added as managers',
        });
      }

      return ctx.db.form.update({
        where: { id: input.formId },
        data: {
          managers: {
            connect: input.managerIds.map((id) => ({ id })),
          },
        },
        include: {
          managers: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });
    }),

  removeManager: protectedProcedure
    .input(z.object({ formId: z.string(), managerId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const form = await ctx.db.form.findUnique({
        where: { id: input.formId },
        select: { createdBy: true },
      });

      if (
        (!form || form.createdBy !== ctx.session.user.id) &&
        ctx.session.user.role !== 'SUPERADMIN'
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only remove managers from your own forms',
        });
      }

      return ctx.db.form.update({
        where: { id: input.formId },
        data: {
          managers: {
            disconnect: { id: input.managerId },
          },
        },
        include: {
          managers: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });
    }),

  getManagers: protectedProcedure
    .input(z.object({ formId: z.string() }))
    .query(async ({ ctx, input }) => {
      const form = await ctx.db.form.findUnique({
        where: { id: input.formId },
        select: { createdBy: true },
      });

      if (!form) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Form not found',
        });
      }

      if (form.createdBy !== ctx.session.user.id && ctx.session.user.role !== 'SUPERADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only view managers of your own forms',
        });
      }

      return ctx.db.form.findUnique({
        where: { id: input.formId },
        select: {
          managers: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });
    }),

  getAvailableAdmins: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPERADMIN'],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }),

  // Form management
  create: protectedProcedure.input(formSchema).mutation(async ({ ctx, input }) => {
    if (input.start && input.end) {
      if (input.end <= input.start) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'End time must be after start time',
        });
      }
    }
    return ctx.db.form.create({
      data: {
        ...input,
        createdBy: ctx.session.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }),

  update: protectedProcedure.input(formSchema).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;

    if (input.start && input.end) {
      if (input.end <= input.start) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'End time must be after start time',
        });
      }
    }

    const existingForm = await ctx.db.form.findUnique({
      where: { id },
      select: { createdBy: true, managers: { select: { id: true } } },
    });

    if (!existingForm) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Form to update is not exist',
      });
    }

    const isOwner = existingForm.createdBy === ctx.session.user.id;
    const isManager = existingForm.managers.some((m) => m.id === ctx.session.user.id);
    const isSuperAdmin = ctx.session.user.role === 'SUPERADMIN';

    if (!isOwner && !isManager && !isSuperAdmin) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You can only edit your own forms or forms you manage',
      });
    }

    return ctx.db.form.update({
      where: { id },
      data,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingForm = await ctx.db.form.findUnique({
        where: { id: input.id },
        select: { createdBy: true, managers: { select: { id: true } } },
      });

      if (!existingForm) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Form not found',
        });
      }

      const isOwner = existingForm.createdBy === ctx.session.user.id;
      const isManager = existingForm.managers.some((m) => m.id === ctx.session.user.id);
      const isSuperAdmin = ctx.session.user.role === 'SUPERADMIN';

      if (!isOwner && !isManager && !isSuperAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only delete your own forms or forms you manage',
        });
      }

      return ctx.db.form.delete({
        where: { id: input.id },
      });
    }),

  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const form = await ctx.db.form.findUnique({
      where: { id: input.id },
      include: {
        submissions: {
          select: {
            notes: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        managers: {
          select: {
            id: true,
          },
        },
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!form) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Form not found',
      });
    }

    // If form is not published, only allow creator, managers, and SUPERADMIN to view
    if (!form.isPublished) {
      const isOwner = form.createdBy === ctx.session?.user?.id;
      const isManager = form.managers.some((m) => m.id === ctx.session?.user?.id);
      const isSuperAdmin = ctx.session?.user.role === 'SUPERADMIN';

      if (!isOwner && !isManager && !isSuperAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'This form is not published',
        });
      }
    }

    return form;
  }),
  getResponsesFormById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const form = await ctx.db.form.findUnique({
        where: { id: input.id },
        include: {
          submissions: {
            select: {
              notes: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          managers: {
            select: {
              id: true,
            },
          },
          questions: {
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!form) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Form is not found',
        });
      }

      return form;
    }),
  getForms: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      const userRole = ctx.session.user.role;
      const userId = ctx.session.user.id;

      let whereCondition = {};

      if (userRole === 'SUPERADMIN') {
        // SUPERADMIN can see all forms
        whereCondition = {};
      } else {
        // other users can see forms they created OR forms they manage
        whereCondition = {
          OR: [{ createdBy: userId }, { managers: { some: { id: userId } } }],
        };
      }

      const forms = await ctx.db.form.findMany({
        where: whereCondition,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: {
            select: {
              questions: true,
              submissions: true,
            },
          },
          managers: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (forms.length > limit) {
        const nextItem = forms.pop();
        nextCursor = nextItem?.id;
      }

      return {
        forms,
        nextCursor,
      };
    }),
  getHotlineForms: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      const forms = await ctx.db.form.findMany({
        where: {
          type: 'HOTLINE',
          isActive: true,
          isPublished: true,
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: {
            select: {
              questions: true,
              submissions: true,
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (forms.length > limit) {
        const nextItem = forms.pop();
        nextCursor = nextItem?.id;
      }

      return {
        forms,
        nextCursor,
      };
    }),
  getCompetitionForms: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      const forms = await ctx.db.form.findMany({
        where: {
          type: 'COMPETITION',
          isActive: true,
          isPublished: true,
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: {
            select: {
              questions: true,
              submissions: true,
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (forms.length > limit) {
        const nextItem = forms.pop();
        nextCursor = nextItem?.id;
      }

      return {
        forms,
        nextCursor,
      };
    }),
  // Question management
  createQuestion: protectedProcedure
    .input(createQuestionSchema)
    .mutation(async ({ ctx, input }) => {
      const form = await ctx.db.form.findUnique({
        where: { id: input.formId },
        select: { createdBy: true, managers: { select: { id: true } } },
      });

      if (!form) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Form not found',
        });
      }

      const isOwner = form.createdBy === ctx.session.user.id;
      const isManager = form.managers.some((m) => m.id === ctx.session.user.id);
      const isSuperAdmin = ctx.session.user.role === 'SUPERADMIN';

      if (!isOwner && !isManager && !isSuperAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only add questions to your own forms or forms you manage',
        });
      }

      return ctx.db.formQuestion.create({
        data: input,
      });
    }),

  updateQuestion: protectedProcedure
    .input(updateQuestionSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const question = await ctx.db.formQuestion.findUnique({
        where: { id },
        include: { form: { select: { createdBy: true, managers: { select: { id: true } } } } },
      });

      if (!question) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Question not found',
        });
      }

      const isOwner = question.form.createdBy === ctx.session.user.id;
      const isManager = question.form.managers.some((m) => m.id === ctx.session.user.id);
      const isSuperAdmin = ctx.session.user.role === 'SUPERADMIN';

      if (!isOwner && !isManager && !isSuperAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only edit questions in your own forms or forms you manage',
        });
      }

      return ctx.db.formQuestion.update({
        where: { id },
        data,
      });
    }),

  deleteQuestion: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const question = await ctx.db.formQuestion.findUnique({
        where: { id: input.id },
        include: { form: { select: { createdBy: true, managers: { select: { id: true } } } } },
      });

      if (!question) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Question not found',
        });
      }

      const isOwner = question.form.createdBy === ctx.session.user.id;
      const isManager = question.form.managers.some((m) => m.id === ctx.session.user.id);
      const isSuperAdmin = ctx.session.user.role === 'SUPERADMIN';

      if (!isOwner && !isManager && !isSuperAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only delete questions in your own forms or forms you manage',
        });
      }

      return ctx.db.formQuestion.delete({
        where: { id: input.id },
      });
    }),

  reorderQuestions: protectedProcedure
    .input(
      z.object({
        formId: z.string(),
        questionIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const form = await ctx.db.form.findUnique({
        where: { id: input.formId },
        select: { createdBy: true, managers: { select: { id: true } } },
      });

      if (!form) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Form not found',
        });
      }

      const isOwner = form.createdBy === ctx.session.user.id;
      const isManager = form.managers.some((m) => m.id === ctx.session.user.id);
      const isSuperAdmin = ctx.session.user.role === 'SUPERADMIN';

      if (!isOwner && !isManager && !isSuperAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only reorder questions in your own forms or forms you manage',
        });
      }

      // Update order for each question
      const updatePromises = input.questionIds.map((questionId, index) =>
        ctx.db.formQuestion.update({
          where: { id: questionId },
          data: { order: index },
        }),
      );

      await Promise.all(updatePromises);

      return { success: true };
    }),

  // Form submission
  submit: publicProcedure.input(submitFormSchema).mutation(async ({ ctx, input }) => {
    const form = await ctx.db.form.findUnique({
      where: { id: input.formId },
      include: { questions: true },
    });

    if (!form || !form.isActive) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Form not found or inactive',
      });
    }

    if (form.requireAuth && !ctx.session?.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Authentication required for this form',
      });
    }

    // Check for existing submissions if not allowed
    if (!form.allowMultipleSubmissions && ctx.session?.user) {
      const existingSubmission = await ctx.db.formSubmission.findFirst({
        where: {
          formId: input.formId,
          submittedBy: ctx.session.user.id,
        },
      });

      if (existingSubmission) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Multiple submissions not allowed for this form',
        });
      }
    }

    // Create submission with answers
    return ctx.db.formSubmission.create({
      data: {
        formId: input.formId,
        submittedBy: ctx.session?.user?.id,
        answers: {
          create: input.answers,
        },
      },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    });
  }),

  // get form submissions (for form creators and managers)
  getSubmissions: protectedProcedure
    .input(
      z.object({
        formId: z.string(),
        limit: z.number().min(1).default(999),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const form = await ctx.db.form.findUnique({
        where: { id: input.formId },
        select: { createdBy: true, managers: { select: { id: true } } },
      });

      if (!form) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Form not found',
        });
      }

      const isOwner = form.createdBy === ctx.session.user.id;
      const isManager = form.managers.some((m) => m.id === ctx.session.user.id);
      const isSuperAdmin = ctx.session.user.role === 'SUPERADMIN';

      if (!isOwner && !isManager && !isSuperAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only view submissions for your own forms or forms you manage',
        });
      }

      const { limit, cursor } = input;

      const submissions = await ctx.db.formSubmission.findMany({
        where: { formId: input.formId },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { submittedAt: 'desc' },
        select: {
          id: true,
          formId: true,
          submittedBy: true,
          submittedAt: true,
          ipAddress: true,
          userAgent: true,
          notes: true,
          submitter: {
            select: {
              id: true,
              name: true,
              email: true,
              nim: true,
            },
          },
          answers: {
            include: {
              question: {
                select: {
                  id: true,
                  title: true,
                  type: true,
                },
              },
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (submissions.length > limit) {
        const nextItem = submissions.pop();
        nextCursor = nextItem?.id;
      }

      return {
        submissions,
        nextCursor,
      };
    }),

  // Helper endpoints for dropdowns
  getUserNames: protectedProcedure
    .input(z.object({ search: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.user.findMany({
        where: input.search
          ? {
              name: {
                contains: input.search,
                mode: 'insensitive',
              },
            }
          : undefined,
        select: {
          id: true,
          name: true,
          email: true,
        },
        take: 50,
        orderBy: { name: 'asc' },
      });
    }),

  getUserNims: protectedProcedure
    .input(z.object({ search: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.user.findMany({
        where: {
          nim: { not: '' },
          ...(input.search
            ? {
                OR: [
                  { nim: { contains: input.search, mode: 'insensitive' } },
                  { name: { contains: input.search, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
        select: {
          id: true,
          name: true,
          nim: true,
        },
        take: 50,
        orderBy: { nim: 'asc' },
      });
    }),

  getCourses: publicProcedure
    .input(z.object({ search: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.course.findMany({
        where: {
          isActive: true,
          ...(input.search
            ? {
                OR: [
                  { title: { contains: input.search, mode: 'insensitive' } },
                  {
                    classCode: { contains: input.search, mode: 'insensitive' },
                  },
                ],
              }
            : {}),
        },
        select: {
          id: true,
          title: true,
          classCode: true,
        },
        take: 50,
        orderBy: { title: 'asc' },
      });
    }),

  getEvents: publicProcedure
    .input(z.object({ search: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.event.findMany({
        where: input.search
          ? {
              title: { contains: input.search, mode: 'insensitive' },
            }
          : {},
        select: {
          id: true,
          title: true,
          start: true,
          location: true,
        },
        take: 50,
        orderBy: { start: 'desc' },
      });
    }),

  getUserSubmissionStatus: protectedProcedure
    .input(z.object({ formId: z.string() }))
    .query(async ({ ctx, input }) => {
      const existingSubmission = await ctx.db.formSubmission.findFirst({
        where: {
          formId: input.formId,
          submittedBy: ctx.session.user.id,
        },
        select: {
          id: true,
          submittedAt: true,
        },
      });
      return existingSubmission;
    }),

  updatePublish: adminProcedure
    .input(z.object({ formId: z.string(), isPublished: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const published = await ctx.db.form.update({
        where: {
          id: input.formId,
        },
        data: {
          isPublished: input.isPublished,
        },
      });

      return published;
    }),

  duplicate: adminProcedure
    .input(z.object({ formId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingForm = await ctx.db.form.findUnique({
        where: { id: input.formId },
        include: { questions: true },
      });

      // if (!existingForm || existingForm.createdBy !== ctx.session.user.id) {
      //   throw new TRPCError({
      //     code: 'FORBIDDEN',
      //     message: 'You can only duplicate your own forms',
      //   });
      // }

      if (!existingForm) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Form to duplicate is not exist',
        });
      }

      // Create new form
      const newForm = await ctx.db.form.create({
        data: {
          title: `${existingForm.title} (Copy)`,
          description: existingForm.description,
          isPublished: false, // reset publish state for safety
          isActive: true,
          createdBy: ctx.session.user.id,
          allowMultipleSubmissions: existingForm.allowMultipleSubmissions,
          requireAuth: existingForm.requireAuth,
          showProgressBar: existingForm.showProgressBar,
          collectEmail: existingForm.collectEmail,
          questions: {
            create: existingForm.questions.map((q) => ({
              title: q.title,
              description: q.description,
              type: q.type,
              required: q.required,
              order: q.order,
              settings: q.settings!,
            })),
          },
        },
        include: { questions: true },
      });

      return newForm;
    }),

  updateSubmissionNote: protectedProcedure
    .input(
      z.object({
        submissionId: z.string(),
        ...updateFormNoteSchema.shape,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const submission = await ctx.db.formSubmission.findUnique({
        where: { id: input.submissionId },
        include: {
          form: {
            select: {
              createdBy: true,
              managers: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      if (!submission) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Submission not found',
        });
      }

      const isOwner = submission.form.createdBy === ctx.session.user.id;
      const isManager = submission.form.managers.some((m) => m.id === ctx.session.user.id);
      const isSuperAdmin = ctx.session.user.role === 'SUPERADMIN';

      if (!isOwner && !isManager && !isSuperAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only update notes for your own forms or forms you manage',
        });
      }

      return ctx.db.formSubmission.update({
        where: { id: input.submissionId },
        data: { notes: input.notes },
      });
    }),
});
