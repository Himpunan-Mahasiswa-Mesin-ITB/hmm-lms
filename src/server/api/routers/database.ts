import type { PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';
// src/server/api/routers/admin/database.ts
import { z } from 'zod';

import { createTRPCRouter, adminProcedure, superAdminProcedure } from '~/server/api/trpc';

// Define model names as const for type safety
const MODEL_NAMES = [
  'user',
  'courseTestimonial',
  'session',
  'course',
  'learningSession',
  'tryout',
  'question',
  'questionOption',
  'userAttempt',
  'userAnswer',
  'event',
  'announcement',
  'scholarship',
  'jobVacancy',
  'pushSubscription',
  'eventRSVPResponse',
] as const;

type ModelName = (typeof MODEL_NAMES)[number];

type GenericModelDelegate = {
  findMany: (args?: Record<string, unknown>) => Promise<unknown[]>;
  count: (args?: Record<string, unknown>) => Promise<number>;
  create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<unknown>;
  delete: (args: { where: { id: string } }) => Promise<unknown>;
  createMany: (args: {
    data: Record<string, unknown>[];
    skipDuplicates?: boolean;
  }) => Promise<unknown>;
  updateMany: (args: {
    where: { id: { in: string[] } };
    data: Record<string, unknown>;
  }) => Promise<unknown>;
  deleteMany: (args: { where: { id: { in: string[] } } }) => Promise<unknown>;
};

// More flexible type for data payloads
const flexibleData = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.string()),
  z.record(z.any()),
  z.array(z.record(z.any())),
]);

// Base pagination schema
const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(15),
  search: z.string().optional(),
  searchColumn: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  filters: z.record(flexibleData).optional(),
});

// Bulk operation schemas
const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1),
  model: z.enum(MODEL_NAMES),
});

const bulkUpdateSchema = z.object({
  ids: z.array(z.string()).min(1),
  model: z.enum(MODEL_NAMES),
  data: z.record(flexibleData),
});

const bulkCreateSchema = z.object({
  model: z.enum(MODEL_NAMES),
  data: z.array(z.record(flexibleData)).min(1),
});

// Helper function to get model delegate
function getModelDelegate(db: PrismaClient, model: ModelName): GenericModelDelegate {
  const delegates = {
    user: db.user,
    courseTestimonial: db.courseTestimonial,
    session: db.session,
    course: db.course,
    learningSession: db.learningSession,
    tryout: db.tryout,
    question: db.question,
    questionOption: db.questionOption,
    userAttempt: db.userAttempt,
    userAnswer: db.userAnswer,
    event: db.event,
    announcement: db.announcement,
    scholarship: db.scholarship,
    jobVacancy: db.jobVacancy,
    pushSubscription: db.pushSubscription,
    eventRSVPResponse: db.eventRSVPResponse,
  };
  return delegates[model] as unknown as GenericModelDelegate;
}

// CORRECTED: A comprehensive map of default sort orders for ALL models.
const DEFAULT_SORT_ORDERS: Record<ModelName, { field: string; order: 'asc' | 'desc' }> = {
  user: { field: 'createdAt', order: 'desc' },
  courseTestimonial: { field: 'createdAt', order: 'desc' },
  session: { field: 'expires', order: 'desc' },
  course: { field: 'createdAt', order: 'desc' },
  learningSession: { field: 'createdAt', order: 'desc' },
  tryout: { field: 'createdAt', order: 'desc' },
  question: { field: 'order', order: 'asc' }, // Sort by question order
  questionOption: { field: 'order', order: 'asc' }, // Sort by option order
  userAttempt: { field: 'startedAt', order: 'desc' },
  userAnswer: { field: 'createdAt', order: 'desc' },
  event: { field: 'createdAt', order: 'desc' },
  announcement: { field: 'createdAt', order: 'desc' },
  scholarship: { field: 'createdAt', order: 'desc' },
  jobVacancy: { field: 'createdAt', order: 'desc' },
  pushSubscription: { field: 'createdAt', order: 'desc' },
  eventRSVPResponse: { field: 'respondedAt', order: 'desc' },
};

// Helper function to build search conditions (no changes)
function buildSearchConditions(model: ModelName, search: string) {
  const searchConditions: Record<ModelName, Record<string, unknown>[]> = {
    user: [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { nim: { contains: search, mode: 'insensitive' } },
    ],
    course: [
      { title: { contains: search, mode: 'insensitive' } },
      { classCode: { contains: search, mode: 'insensitive' } },
    ],
    tryout: [{ title: { contains: search, mode: 'insensitive' } }],
    event: [{ title: { contains: search, mode: 'insensitive' } }],
    announcement: [{ title: { contains: search, mode: 'insensitive' } }],
    scholarship: [
      { title: { contains: search, mode: 'insensitive' } },
      { provider: { contains: search, mode: 'insensitive' } },
    ],
    jobVacancy: [
      { title: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
    ],
    learningSession: [],
    session: [],
    question: [],
    questionOption: [],
    userAttempt: [],
    userAnswer: [],
    pushSubscription: [],
    courseTestimonial: [
      { comment: { contains: search, mode: 'insensitive' } },
      { rating: isNaN(Number(search)) ? undefined : Number(search) },
    ],
    eventRSVPResponse: [
      { guestName: { contains: search, mode: 'insensitive' } },
      { guestEmail: { contains: search, mode: 'insensitive' } },
      { guestPhone: { contains: search, mode: 'insensitive' } },
    ],
  };
  return searchConditions[model] ?? [];
}

// Helper function to get model includes (no changes)
function getModelIncludes(model: ModelName) {
  const includes: Record<ModelName, Record<string, unknown>> = {
    user: {
      _count: {
        select: {
          courses: true,
          learningSessions: true,
          userAttempts: true,
          events: true,
        },
      },
    },
    course: {
      _count: {
        select: { members: true, learningSession: true, tryout: true },
      },
    },
    tryout: {
      _count: { select: { questions: true, attempts: true } },
      course: { select: { title: true, classCode: true } },
    },
    learningSession: {},
    session: {},
    question: {},
    questionOption: {},
    userAttempt: {},
    userAnswer: {},
    event: {},
    announcement: {},
    scholarship: {},
    jobVacancy: {},
    pushSubscription: {},
    courseTestimonial: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true, classCode: true } },
    },
    eventRSVPResponse: {
      event: { select: { title: true, start: true, end: true } },
      user: { select: { name: true, email: true, nim: true } },
      approver: { select: { name: true, email: true } },
    },
  };
  return includes[model] ?? {};
}

export const databaseRouter = createTRPCRouter({
  getModels: adminProcedure.query(async () => {
    return MODEL_NAMES.map((name) => ({
      name,
      displayName:
        name === 'eventRSVPResponse'
          ? 'Event RSVP Responses'
          : name.charAt(0).toUpperCase() + name.slice(1),
    })).sort((a, b) => a.displayName.localeCompare(b.displayName));
  }),

  getData: adminProcedure
    .input(z.object({ model: z.enum(MODEL_NAMES), ...paginationSchema.shape }))
    .query(async ({ ctx, input }) => {
      const { model, page, limit, search, searchColumn, sortBy, sortOrder, filters } = input;
      const skip = (page - 1) * limit;

      try {
        const modelDelegate = getModelDelegate(ctx.db, model);
        let where: Record<string, unknown> = {};

        if (search?.trim()) {
          if (searchColumn && searchColumn !== 'all') {
            // Column-specific search
            where[searchColumn] = { contains: search, mode: 'insensitive' };
          } else {
            // Multi-column search
            const searchConditions = buildSearchConditions(model, search);
            if (searchConditions.length > 0) where.OR = searchConditions;
          }
        }

        if (filters) {
          where = { ...where, ...filters };
        }

        // CORRECTED: Safe default sorting logic
        const orderBy: Record<string, string> = {};
        if (sortBy) {
          orderBy[sortBy] = sortOrder;
        } else {
          // Always use the safe default defined for the specific model
          const defaultSort = DEFAULT_SORT_ORDERS[model];
          orderBy[defaultSort.field] = defaultSort.order;
        }

        const include = getModelIncludes(model);

        const [data, total] = await Promise.all([
          modelDelegate.findMany({
            where,
            skip,
            take: limit,
            orderBy,
            ...(Object.keys(include).length > 0 && { include }),
          }),
          modelDelegate.count({ where }),
        ]);

        return {
          data,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
      } catch (error) {
        console.error(`Error fetching ${model} data:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch ${model} data.`,
          cause: error,
        });
      }
    }),

  // Export data (Admin can export) - No changes needed
  exportData: adminProcedure
    .input(
      z.object({
        model: z.enum(MODEL_NAMES),
        filters: z.record(flexibleData).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { model, filters } = input;
      try {
        const modelDelegate = getModelDelegate(ctx.db, model);
        const data = await modelDelegate.findMany({
          where: filters ?? {},
          take: 10000,
        });
        return { data, count: data.length };
      } catch (error) {
        console.error(`Error exporting ${model} data:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to export ${model} data`,
        });
      }
    }),

  // SUPERADMIN ONLY OPERATIONS BELOW

  createRecord: superAdminProcedure
    .input(
      z.object({
        model: z.enum(MODEL_NAMES),
        data: z.record(flexibleData),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { model, data } = input;
      try {
        const modelDelegate = getModelDelegate(ctx.db, model);
        const result = await modelDelegate.create({ data });
        return result;
      } catch (error) {
        console.error(`Error creating ${model}:`, error);
        throw new TRPCError({
          code: 'BAD_REQUEST', // More specific error
          message: `Failed to create ${model}. Check data format.`,
          cause: error,
        });
      }
    }),

  updateRecord: superAdminProcedure
    .input(
      z.object({
        model: z.enum(MODEL_NAMES),
        id: z.string(),
        data: z.record(flexibleData),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { model, id, data } = input;
      try {
        const modelDelegate = getModelDelegate(ctx.db, model);
        const result = await modelDelegate.update({ where: { id }, data });
        return result;
      } catch (error) {
        console.error(`Error updating ${model}:`, error);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Failed to update ${model} with id ${id}.`,
          cause: error,
        });
      }
    }),

  deleteRecord: superAdminProcedure
    .input(z.object({ model: z.enum(MODEL_NAMES), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { model, id } = input;
      try {
        const modelDelegate = getModelDelegate(ctx.db, model);
        const result = await modelDelegate.delete({ where: { id } });
        return result;
      } catch (error) {
        console.error(`Error deleting ${model}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to delete ${model}`,
        });
      }
    }),

  bulkCreate: superAdminProcedure.input(bulkCreateSchema).mutation(async ({ ctx, input }) => {
    const { model, data } = input;
    try {
      const modelDelegate = getModelDelegate(ctx.db, model);
      const result = await modelDelegate.createMany({
        data,
        skipDuplicates: true,
      });
      return result;
    } catch (error) {
      console.error(`Error bulk creating ${model}:`, error);
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Failed to bulk create ${model}. Check data format.`,
        cause: error,
      });
    }
  }),

  bulkUpdate: superAdminProcedure.input(bulkUpdateSchema).mutation(async ({ ctx, input }) => {
    const { model, ids, data } = input;
    try {
      const modelDelegate = getModelDelegate(ctx.db, model);
      const result = await modelDelegate.updateMany({
        where: { id: { in: ids } },
        data,
      });
      return result;
    } catch (error) {
      console.error(`Error bulk updating ${model}:`, error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to bulk update ${model}`,
      });
    }
  }),

  bulkDelete: superAdminProcedure.input(bulkDeleteSchema).mutation(async ({ ctx, input }) => {
    const { model, ids } = input;
    try {
      const modelDelegate = getModelDelegate(ctx.db, model);
      const result = await modelDelegate.deleteMany({
        where: { id: { in: ids } },
      });
      return result;
    } catch (error) {
      console.error(`Error bulk deleting ${model}:`, error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to bulk delete ${model}`,
      });
    }
  }),
});
