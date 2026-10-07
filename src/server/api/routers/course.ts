import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  AttachableType,
  Role,
  ResourceCategory,
  LinkSource,
  ResourceType,
  type PrismaClient,
} from "@prisma/client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "~/lib/s3-client";
import { NotificationTriggers } from "~/server/services/notification-triggers";

export const createCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  classCode: z
    .string()
    .min(6, "Class code must be at least 6 characters")
    .max(50),
});

export const unenrollCourseSchema = z.object({
  courseId: z.string().cuid(),
});

export const updateCourseSchema = createCourseSchema.extend({
  id: z.string().cuid(),
  title: z.string(),
  description: z.string().optional(),
  lecturers: z.string().optional(),
  image: z.string().nullable(),
  classCode: z.string(),
  scope: z.enum(["GLOBAL", "MACHINING"]),
  type: z.enum(["MANDATORY", "OPTIONAL", "MACHINING"]),
});

export const courseIdSchema = z.object({
  id: z.string().cuid(),
});

export const joinCourseSchema = z.object({
  classCode: z.string(),
});

export const enrollCourseSchema = z.object({
  courseId: z.string().cuid(),
});

// Define Zod schemas for both file and link data
const fileInputSchema = z.object({
  type: z.literal(ResourceType.FILE),
  file: z.object({
    key: z.string(),
    name: z.string(),
    type: z.string(),
    size: z.number(),
  }),
});

const linkInputSchema = z.object({
  type: z.literal(ResourceType.LINK),
  link: z.object({
    url: z.string().url(),
    source: z.nativeEnum(LinkSource),
  }),
});

// Combine the schemas for the main input
const createResourceSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().optional(),
    category: z.nativeEnum(ResourceCategory).optional(),
    attachableId: z.string().cuid(),
    attachableType: z.nativeEnum(AttachableType),
  })
  .and(z.union([fileInputSchema, linkInputSchema]));

async function assertCourseExists(db: PrismaClient, courseId: string) {
  const course = await db.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Course not found",
    });
  }

  return course;
}

export const courseRouter = createTRPCRouter({
  createCourse: adminProcedure
    .input(createCourseSchema)
    .mutation(async ({ ctx, input }) => {
      const data = await ctx.db.course.create({
        data: input,
      });

      if (data) {
        await NotificationTriggers.onCourseCreated(data.id);
      }

      return data;
    }),

  createDraft: adminProcedure.mutation(async ({ ctx }) => {
    const data = await ctx.db.course.create({
      data: {
        title: "Untitled Course",
        description: "",
        classCode: `DRAFT-${Date.now()}`, // Temporary unique code
      },
    });

    return data;
  }),


  updateCourse: adminProcedure
    .input(updateCourseSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.course.update({
        where: { id },
        data,
      });
    }),

  delete: adminProcedure
    .input(courseIdSchema)
    .mutation(async ({ ctx, input }) => {
      await assertCourseExists(ctx.db, input.id);
      return ctx.db.course.delete({
        where: { id: input.id },
      });
    }),

  deleteCourse: adminProcedure
    .input(courseIdSchema)
    .mutation(async ({ ctx, input }) => {
      await assertCourseExists(ctx.db, input.id);

      return ctx.db.course.delete({
        where: { id: input.id },
      });
    }),

  createResource: adminProcedure
    .input(createResourceSchema)
    .mutation(async ({ ctx, input }) => {
      const { title, description, category, attachableId, attachableType } =
        input;

      return ctx.db.resource.create({
        data: {
          title,
          description,
          category,
          type: input.type,
          attachableId,
          attachableType,
          uploadedById: ctx.session.user.id,
          ...(input.type === "FILE" && {
            attachment: {
              create: {
                filename: input.file.name,
                key: input.file.key,
                mimeType: input.file.type,
                size: input.file.size,
              },
            },
          }),
          ...(input.type === "LINK" && {
            link: {
              create: {
                url: input.link.url,
                source: input.link.source,
              },
            },
          }),
        },
      });
    }),

  deleteResource: adminProcedure
    .input(z.object({ resourceId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const resource = await ctx.db.resource.findUnique({
        where: { id: input.resourceId },
        include: { attachment: true },
      });

      if (!resource) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Resource not found",
        });
      }

      // If the resource is a file, delete it from DigitalOcean Spaces
      if (resource.type === ResourceType.FILE && resource.attachment) {
        try {
          const deleteCommand = new DeleteObjectCommand({
            Bucket: process.env.DO_SPACES_BUCKET,
            Key: resource.attachment.key,
          });
          await s3Client.send(deleteCommand);
        } catch (error) {
          console.error("Failed to delete from DigitalOcean Spaces:", error);
        }
      }

      // Delete the resource record and related data from the database
      await ctx.db.resource.delete({
        where: { id: input.resourceId },
      });

      return { success: true };
    }),

  getMyCourses: protectedProcedure.query(async ({ ctx }) => {
    const courses = await ctx.db.course.findMany({
      where: {
        members: { some: { id: ctx.session.user.id } },
        NOT: {
          scope: "MACHINING",
        },
      },
      include: {
        _count: {
          select: {
            members: true,
            tryout: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const courseIds = courses.map(c => c.id);

    // Aggregate link counts
    const videoCounts = await ctx.db.resource.groupBy({
      by: ['attachableId'],
      where: {
        attachableType: 'COURSE',
        attachableId: { in: courseIds },
        category: 'VIDEO',
        isActive: true,
      },
      _count: { _all: true },
    });

    // Aggregate file (attachment) counts
    const fileCounts = await ctx.db.resource.groupBy({
      by: ['attachableId'],
      where: {
        attachableType: 'COURSE',
        attachableId: { in: courseIds },
        category: {
          not: 'VIDEO'
        },
        isActive: true,
      },
      _count: { _all: true },
    });

    const videoMap = new Map(videoCounts.map(r => [r.attachableId, r._count._all]));
    const fileMap = new Map(fileCounts.map(r => [r.attachableId, r._count._all]));

    return courses.map(c => ({
      ...c,
      _count: {
        ...c._count,
        videos: videoMap.get(c.id) ?? 0,
        attachments: fileMap.get(c.id) ?? 0,
      },
    }));
  }),

  getAllCourses: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.course.findMany({
      include: {
        _count: {
          select: {
            members: true,
            tryout: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
  getGlobalCourses: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.course.findMany({
      where: {
        scope: "GLOBAL"
      },
      include: {
        _count: {
          select: {
            members: true,
            tryout: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),

  getMyMachiningCourses: protectedProcedure.query(async ({ ctx }) => {
    const courses = await ctx.db.course.findMany({
      where: {
        members: { some: { id: ctx.session.user.id } },
        scope: "MACHINING"
      },
      include: {
        _count: {
          select: {
            members: true,
            tryout: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const courseIds = courses.map(c => c.id);

    // Aggregate link counts
    const videoCounts = await ctx.db.resource.groupBy({
      by: ['attachableId'],
      where: {
        attachableType: 'COURSE',
        attachableId: { in: courseIds },
        category: 'VIDEO',
        isActive: true,
      },
      _count: { _all: true },
    });

    // Aggregate file (attachment) counts
    const fileCounts = await ctx.db.resource.groupBy({
      by: ['attachableId'],
      where: {
        attachableType: 'COURSE',
        attachableId: { in: courseIds },
        category: {
          not: 'VIDEO'
        },
        isActive: true,
      },
      _count: { _all: true },
    });

    const videoMap = new Map(videoCounts.map(r => [r.attachableId, r._count._all]));
    const fileMap = new Map(fileCounts.map(r => [r.attachableId, r._count._all]));

    return courses.map(c => ({
      ...c,
      _count: {
        ...c._count,
        videos: videoMap.get(c.id) ?? 0,
        attachments: fileMap.get(c.id) ?? 0,
      },
    }));
  }),
  getMachiningCourses: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.course.findMany({
      where: {
        scope: "MACHINING"
      },
      include: {
        _count: {
          select: {
            members: true,
            tryout: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),

  getCourseById: protectedProcedure
    .input(courseIdSchema)
    .query(async ({ ctx, input }) => {
      const course = await ctx.db.course.findUnique({
        where: { id: input.id },
        include: {
          members: {
            select: { id: true, name: true, email: true, role: true },
          },
          tryout: {
            select: {
              id: true,
              title: true,
              description: true,
              duration: true,
              isActive: true,
              createdAt: true,
              _count: {
                select: {
                  questions: true,
                  attempts: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          testimonial: {
            include: {
              user: true,
            },
          },
          announcements: {
            select: {
              id: true,
              title: true,
              content: true,
              createdAt: true,
              createdBy: {
                select: {
                  name: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 5,
          },
          _count: {
            select: {
              members: true,
              tryout: true,
              announcements: true,
            },
          },
        },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      const resourceCount = await ctx.db.resource.count({
        where: {
          attachableId: input.id,
          attachableType: AttachableType.COURSE,
        },
      });

      const isEnrolled = course.members.some(
        (member) => member.id === ctx.session.user.id,
      );
      const isAdmin = ctx.session.user.role === Role.ADMIN;

      return {
        ...course,
        _count: {
          ...course._count,
          resources: resourceCount,
        },
        isEnrolled,
        isAdmin,
      };
    }),

  updateResourceStatus: adminProcedure
    .input(
      z.object({
        resourceId: z.string().cuid(),
        isActive: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.resource.update({
        where: { id: input.resourceId },
        data: { isActive: input.isActive },
      });
    }),

  getCourseMaterials: protectedProcedure
    .input(courseIdSchema)
    .query(async ({ ctx, input }) => {
      const courseMembership = await ctx.db.course.findFirst({
        where: { id: input.id, members: { some: { id: ctx.session.user.id } } },
        select: { id: true },
      });
      const isAdmin = ctx.session.user.role === Role.ADMIN;

      if (!courseMembership && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be enrolled to access course materials",
        });
      }

      const resources = await ctx.db.resource.findMany({
        where: {
          attachableId: input.id,
          attachableType: AttachableType.COURSE,
          isActive: true,
        },
        include: {
          attachment: true,
          link: true,
          uploadedBy: {
            select: { name: true },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return resources.reduce(
        (acc, resource) => {
          const category = resource.category ?? "OTHER";
          (acc[category] = acc[category] || []).push(resource);
          return acc;
        },
        {} as Record<ResourceCategory, typeof resources>,
      );
    }),

  enrollInCourse: protectedProcedure
    .input(enrollCourseSchema)
    .mutation(async ({ ctx, input }) => {
      const course = await ctx.db.course.findUnique({
        where: { id: input.courseId },
        include: {
          members: {
            where: { id: ctx.session.user.id },
            select: { id: true },
          },
        },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      if (course.members.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You are already enrolled in this course",
        });
      }

      await ctx.db.course.update({
        where: { id: course.id },
        data: {
          members: {
            connect: { id: ctx.session.user.id },
          },
        },
      });

      return {
        success: true,
        message: "Successfully enrolled in the course!",
        courseId: course.id,
      };
    }),

  unenrollFromCourse: protectedProcedure
    .input(unenrollCourseSchema)
    .mutation(async ({ ctx, input }) => {
      const course = await ctx.db.course.findUnique({
        where: { id: input.courseId },
        include: {
          members: {
            where: { id: ctx.session.user.id },
            select: { id: true },
          },
        },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found.",
        });
      }

      if (course.members.length === 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You are not currently enrolled in this course.",
        });
      }

      await ctx.db.course.update({
        where: { id: input.courseId },
        data: {
          members: {
            disconnect: { id: ctx.session.user.id },
          },
        },
      });

      return {
        success: true,
        message: `You have successfully unenrolled from "${course.title}".`,
        courseId: course.id,
      };
    }),

  getCourseForAdmin: adminProcedure
    .input(courseIdSchema)
    .query(async ({ ctx, input }) => {
      const course = await ctx.db.course.findUnique({
        where: { id: input.id },
        include: {
          members: {
            select: {
              id: true,
              name: true,
              email: true,
              nim: true,
              faculty: true,
              program: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
          },
          tryout: {
            include: {
              _count: {
                select: {
                  questions: true,
                  attempts: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          announcements: {
            include: {
              createdBy: {
                select: { name: true },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: {
              members: true,
              tryout: true,
              announcements: true,
            },
          },
        },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      const resources = await ctx.db.resource.findMany({
        where: {
          attachableId: input.id,
          attachableType: AttachableType.COURSE,
        },
        include: {
          attachment: true,
          link: true,
          uploadedBy: { select: { name: true } },
          _count: { select: { accessLogs: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return {
        ...course,
        resources,
        _count: {
          ...course._count,
          resources: resources.length,
        },
      };
    }),

  getCourseAnalytics: adminProcedure
    .input(courseIdSchema)
    .query(async ({ ctx, input }) => {
      const documentStats = await ctx.db.resourceAccess.groupBy({
        by: ["action"],
        where: {
          resource: {
            attachableId: input.id,
            attachableType: AttachableType.COURSE,
          },
        },
        _count: {
          _all: true,
        },
      });

      const tryoutStats = await ctx.db.userAttempt.groupBy({
        by: ["isCompleted"],
        where: { tryout: { courseId: input.id } },
        _count: { _all: true },
        _avg: { score: true },
      });

      const recentActivity = await ctx.db.resourceAccess.findMany({
        where: {
          resource: {
            attachableId: input.id,
            attachableType: AttachableType.COURSE,
          },
        },
        include: {
          user: { select: { name: true } },
          resource: { select: { title: true } },
        },
        orderBy: {
          accessedAt: "desc",
        },
        take: 10,
      });

      return {
        documentStats,
        tryoutStats,
        recentActivity,
      };
    }),

  removeMember: adminProcedure
    .input(
      z.object({
        courseId: z.string().cuid(),
        userId: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { courseId, userId } = input;

      const course = await ctx.db.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found.",
        });
      }

      await ctx.db.course.update({
        where: { id: courseId },
        data: {
          members: {
            disconnect: { id: userId },
          },
        },
      });

      return { success: true };
    }),

  bulkRemoveMembers: adminProcedure
    .input(
      z.object({
        courseId: z.string().cuid(),
        userIds: z.array(z.string().cuid()).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { courseId, userIds } = input;

      const course = await ctx.db.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found.",
        });
      }

      await ctx.db.course.update({
        where: { id: courseId },
        data: {
          members: {
            disconnect: userIds.map((id) => ({ id })),
          },
        },
      });

      return {
        success: true,
        removedCount: userIds.length,
      };
    }),

  removeCourseMembers: adminProcedure
    .input(
      z.object({
        courseId: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { courseId } = input;
      const course = await ctx.db.course.findUnique({
        where: { id: courseId },
        include: { members: true },
      });
      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found.",
        });
      }
      const memberIds = course.members.map((member) => member.id);
      await ctx.db.course.update({
        where: { id: courseId },
        data: {
          members: {
            disconnect: memberIds.map((id) => ({ id })),
          },
        },
      });
      return { success: true, removedCount: memberIds.length };
    }),

  getCoursesForSelection: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.course.findMany({
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        title: "asc",
      },
    });
  }),
});
