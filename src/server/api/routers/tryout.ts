import { createId } from '@paralleldrive/cuid2';
import { TRPCError } from '@trpc/server';
import z from 'zod';

import {
  createTryoutSchema,
  updateTryoutSchema,
  tryoutIdSchema,
  courseIdSchema,
} from '~/lib/schema/tryout';
import { createTRPCRouter, protectedProcedure, adminProcedure } from '~/server/api/trpc';
import { NotificationTriggers } from '~/server/services/notification-triggers';

export const tryoutRouter = createTRPCRouter({
  createDraft: adminProcedure.mutation(async ({ ctx }) => {
    const course = await ctx.db.course.findFirst({});

    if (!course) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Course not found',
      });
    }

    const newTryout = await ctx.db.tryout.create({
      data: {
        title: 'Untitled Tryout',
        description: '',
        duration: 60, // Default 60 minutes
        courseId: course.id,
        isActive: true,
      },
    });

    return newTryout;
  }),

  create: adminProcedure
    .input(createTryoutSchema)
    .mutation(async ({ ctx, input }) => {
      const { questions, ...tryoutData } = input;

      const newTryout = await ctx.db.$transaction(async (tx) => {
        const tryoutId = createId();

        await tx.tryout.create({
          data: {
            id: tryoutId,
            ...tryoutData,
          },
        });

        if (questions && questions.length > 0) {
          const questionData: any[] = [];
          const optionData: any[] = [];

          questions.forEach((question, index) => {
            const questionId = createId();

            questionData.push({
              id: questionId,
              tryoutId: tryoutId,
              type: question.type,
              question: question.question,
              images: question.images,
              points: question.points,
              required: question.required,
              order: index + 1,
              explanation: question.explanation,
              explanationImages: question.explanationImages ?? [],
              shortAnswers: question.shortAnswers?.map((ans) => ans.value) ?? [],
            });

            if (question.options && question.options.length > 0) {
              question.options.forEach((option, optionIndex) => {
                optionData.push({
                  id: createId(),
                  questionId: questionId,
                  text: option.text,
                  isCorrect: option.isCorrect,
                  explanation: option.explanation,
                  order: optionIndex + 1,
                  images: option.images,
                });
              });
            }
          });

          // 3. Perform bulk inserts (2 fast queries instead of hundreds)
          if (questionData.length > 0) {
            await tx.question.createMany({ data: questionData });
          }

          if (optionData.length > 0) {
            await tx.questionOption.createMany({ data: optionData }); // Adjust model name if different (e.g., tx.option)
          }
        }

        return tx.tryout.findUnique({
          where: { id: tryoutId },
          include: {
            questions: {
              include: {
                options: true,
              },
              orderBy: { order: 'asc' },
            },
            course: {
              select: { title: true, classCode: true },
            },
          },
        });
      });

      if (newTryout) await NotificationTriggers.onTryoutCreated(newTryout?.id);
      return newTryout;
    }),

  update: adminProcedure
    .input(updateTryoutSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, questions, ...updateData } = input;

      return ctx.db.$transaction(
        async (tx) => {
          await tx.tryout.update({
            where: { id },
            data: updateData,
          });

          if (questions) {
            await tx.question.deleteMany({
              where: { tryoutId: id },
            });

            const questionData: any[] = [];
            const optionData: any[] = [];

            questions.forEach((q, index) => {
              const questionId = createId();

              questionData.push({
                id: questionId,
                tryoutId: id,
                type: q.type,
                question: q.question,
                images: q.images,
                points: q.points,
                required: q.required,
                order: index + 1,
                explanation: q.explanation,
                explanationImages: q.explanationImages ?? [],
                shortAnswers: q.shortAnswers?.map((ans) => ans.value),
              });

              if (q.options && q.options.length > 0) {
                q.options.forEach((opt, optIndex) => {
                  optionData.push({
                    id: createId(),
                    questionId: questionId,
                    text: opt.text,
                    isCorrect: opt.isCorrect,
                    explanation: opt.explanation,
                    order: optIndex + 1,
                    images: opt.images,
                  });
                });
              }
            });

            if (questionData.length > 0) {
              await tx.question.createMany({ data: questionData });
            }

            if (optionData.length > 0) {
              await tx.questionOption.createMany({ data: optionData });
            }
          }

          return tx.tryout.findUnique({
            where: { id },
            include: {
              questions: {
                include: { options: true },
                orderBy: { order: 'asc' },
              },
              course: {
                select: { title: true, classCode: true },
              },
            },
          });
        },
        {
          timeout: 10000,
        },
      )
    }),
  getMyTryouts: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const coursesWithTryouts = await ctx.db.course.findMany({
      where: {
        members: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        tryout: {
          where: {
            isActive: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            attempts: {
              where: {
                userId: userId,
              },
              orderBy: {
                startedAt: 'desc',
              },
            },
            _count: {
              select: {
                questions: true,
                attempts: true,
              },
            },
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
    });
    return coursesWithTryouts.filter((course) => course.tryout.length > 0);
  }),
  getMyMachiningTryouts: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const coursesWithTryouts = await ctx.db.course.findMany({
      where: {
        members: {
          some: {
            id: userId,
          },
        },
        OR: [
          { scope: "MACHINING" },
          { type: "MACHINING" },
        ],
      },
      include: {
        tryout: {
          where: {
            isActive: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            attempts: {
              where: {
                userId: userId,
              },
              orderBy: {
                startedAt: 'desc',
              },
            },
            _count: {
              select: {
                questions: true,
                attempts: true,
              },
            },
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
    });
    return coursesWithTryouts.filter((course) => course.tryout.length > 0);
  }),

  getById: protectedProcedure.input(tryoutIdSchema).query(async ({ ctx, input }) => {
    const tryout = await ctx.db.tryout.findUnique({
      where: { id: input.id },
      include: {
        questions: {
          include: {
            options: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
        course: {
          select: { title: true, classCode: true },
        },
        _count: {
          select: { attempts: true },
        },
      },
    });

    if (!tryout) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Tryout not found',
      });
    }

    return tryout;
  }),

  getForStudent: protectedProcedure.input(tryoutIdSchema).query(async ({ ctx, input }) => {
    const tryout = await ctx.db.tryout.findUnique({
      where: { id: input.id, isActive: true },
      include: {
        questions: {
          include: {
            options: {
              select: {
                id: true,
                text: true,
                order: true,
                images: true,
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
        course: {
          select: { title: true, classCode: true },
        },
      },
    });

    if (!tryout) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Tryout not found or not active',
      });
    }

    const enrollment = await ctx.db.course.findFirst({
      where: {
        id: tryout.courseId,
        members: {
          some: { id: ctx.session.user.id },
        },
      },
    });

    if (!enrollment) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not enrolled in this course',
      });
    }

    return tryout;
  }),

  startAttempt: protectedProcedure.input(tryoutIdSchema).mutation(async ({ ctx, input }) => {
    const tryout = await ctx.db.tryout.findUnique({
      where: { id: input.id, isActive: true },
      include: {
        questions: true,
        course: {
          select: {
            members: {
              where: { id: ctx.session.user.id },
              select: { id: true },
            },
          },
        },
      },
    });

    if (!tryout) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Tryout not found or not active',
      });
    }

    if (tryout.course.members.length === 0) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not enrolled in this course',
      });
    }

    const existingAttempt = await ctx.db.userAttempt.findFirst({
      where: {
        userId: ctx.session.user.id,
        tryoutId: input.id,
        isCompleted: false,
      },
    });

    if (existingAttempt) {
      return existingAttempt;
    }

    const maxScore = tryout.questions.reduce((sum, q) => sum + q.points, 0);

    return ctx.db.userAttempt.create({
      data: {
        userId: ctx.session.user.id,
        tryoutId: input.id,
        maxScore,
      },
    });
  }),

  submitAnswer: protectedProcedure
    .input(
      z.object({
        attemptId: z.string().cuid(),
        questionId: z.string().cuid(),
        answer: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const attempt = await ctx.db.userAttempt.findUnique({
        where: {
          id: input.attemptId,
          userId: ctx.session.user.id,
          isCompleted: false,
        },
        include: {
          tryout: {
            include: {
              questions: {
                include: { options: true },
              },
            },
          },
        },
      });

      if (!attempt) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Attempt not found or already completed',
        });
      }

      const question = attempt.tryout.questions.find((q) => q.id === input.questionId);
      if (!question) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Question not found',
        });
      }

      let points = 0;
      if (question.type === 'MULTIPLE_CHOICE_SINGLE') {
        const selectedOption = question.options.find((opt) => opt.id === input.answer);
        if (selectedOption?.isCorrect) {
          points = question.points;
        }
      } else if (question.type === 'MULTIPLE_CHOICE_MULTIPLE') {
        try {
          const selectedOptions = JSON.parse(input.answer) as string[];
          const correctOptions = question.options.filter((opt) => opt.isCorrect);
          const selectedCorrectOptions = selectedOptions.filter((optId) =>
            correctOptions.some((opt) => opt.id === optId),
          );

          if (
            selectedCorrectOptions.length === correctOptions.length &&
            selectedOptions.length === correctOptions.length
          ) {
            points = question.points;
          }
        } catch {
          points = 0;
        }
      } else if (question.type === 'SHORT_ANSWER') {
        if (
          Array.isArray(question.shortAnswers) &&
          question.shortAnswers.some(
            (ans) => ans.trim().toLowerCase() === input.answer.trim().toLowerCase(),
          )
        ) {
          points = question.points;
        }
      }

      return ctx.db.userAnswer.upsert({
        where: {
          attemptId_questionId: {
            attemptId: input.attemptId,
            questionId: input.questionId,
          },
        },
        update: {
          answer: input.answer,
          points,
        },
        create: {
          attemptId: input.attemptId,
          questionId: input.questionId,
          answer: input.answer,
          points,
        },
      });
    }),
  submitAnswersBatch: protectedProcedure
    .input(
      z.object({
        attemptId: z.string().cuid(),
        answers: z.array(
          z.object({
            questionId: z.string().cuid(),
            answer: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const attempt = await ctx.db.userAttempt.findUnique({
        where: {
          id: input.attemptId,
          userId: ctx.session.user.id,
          isCompleted: false,
        },
        include: {
          tryout: {
            include: {
              questions: {
                include: { options: true },
              },
            },
          },
        },
      });

      if (!attempt) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Attempt not found or already completed',
        });
      }

      input.answers.map((ansItem) => {
        const question = attempt.tryout.questions.find((q) => q.id === ansItem.questionId);

        if (!question) return null;

        let points = 0;

        if (question.type === 'MULTIPLE_CHOICE_SINGLE') {
          const selectedOption = question.options.find((opt) => opt.id === ansItem.answer);
          if (selectedOption?.isCorrect) {
            points = question.points;
          }
        } else if (question.type === 'MULTIPLE_CHOICE_MULTIPLE') {
          try {
            const selectedOptions = JSON.parse(ansItem.answer) as string[];
            const correctOptions = question.options.filter((opt) => opt.isCorrect);
            const selectedCorrectOptions = selectedOptions.filter((optId) =>
              correctOptions.some((opt) => opt.id === optId),
            );

            if (
              selectedCorrectOptions.length === correctOptions.length &&
              selectedOptions.length === correctOptions.length
            ) {
              points = question.points;
            }
          } catch {
            points = 0;
          }
        } else if (question.type === 'SHORT_ANSWER') {
          if (
            Array.isArray(question.shortAnswers) &&
            question.shortAnswers.some(
              (ans) => ans.trim().toLowerCase() === ansItem.answer.trim().toLowerCase(),
            )
          ) {
            points = question.points;
          }
        }

        return ctx.db.userAnswer.upsert({
          where: {
            attemptId_questionId: {
              attemptId: input.attemptId,
              questionId: ansItem.questionId,
            },
          },
          update: {
            answer: ansItem.answer,
            points,
          },
          create: {
            attemptId: input.attemptId,
            questionId: ansItem.questionId,
            answer: ansItem.answer,
            points,
          },
        });
      });
    }),
  completeAttempt: protectedProcedure
    .input(z.object({ attemptId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const attempt = await ctx.db.userAttempt.findUnique({
        where: {
          id: input.attemptId,
          userId: ctx.session.user.id,
          isCompleted: false,
        },
        include: {
          answers: true,
        },
      });

      if (!attempt) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Attempt not found or already completed',
        });
      }

      const totalScore = attempt.answers.reduce((sum, answer) => sum + answer.points, 0);

      return ctx.db.userAttempt.update({
        where: { id: input.attemptId },
        data: {
          score: totalScore,
          isCompleted: true,
          endedAt: new Date(),
        },
      });
    }),

  getUserAttempts: protectedProcedure.input(tryoutIdSchema).query(async ({ ctx, input }) => {
    return ctx.db.userAttempt.findMany({
      where: {
        userId: ctx.session.user.id,
        tryoutId: input.id,
      },
      include: {
        tryout: {
          select: { title: true, duration: true },
        },
      },
      orderBy: { startedAt: 'desc' },
    });
  }),

  getAttemptResults: protectedProcedure
    .input(z.object({ attemptId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const attempt = await ctx.db.userAttempt.findUnique({
        where: {
          id: input.attemptId,
          userId: ctx.session.user.id,
        },
        include: {
          tryout: true,
          answers: {
            include: {
              question: {
                include: {
                  options: true,
                },
              },
            },
          },
        },
      });

      if (!attempt) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Attempt not found',
        });
      }

      return attempt;
    }),

  getActiveAttempt: protectedProcedure.input(tryoutIdSchema).query(async ({ ctx, input }) => {
    return ctx.db.userAttempt.findFirst({
      where: {
        userId: ctx.session.user.id,
        tryoutId: input.id,
        isCompleted: false,
      },
      include: {
        answers: true,
        tryout: {
          select: {
            title: true,
            duration: true,
            questions: {
              select: { id: true },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });
  }),

  getByCourse: protectedProcedure.input(courseIdSchema).query(async ({ ctx, input }) => {
    return ctx.db.tryout.findMany({
      where: { courseId: input.courseId },
      include: {
        _count: {
          select: { questions: true, attempts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }),

  delete: adminProcedure.input(tryoutIdSchema).mutation(async ({ ctx, input }) => {
    const tryout = await ctx.db.tryout.findUnique({
      where: { id: input.id },
    });

    if (!tryout) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Tryout not found',
      });
    }

    return ctx.db.tryout.delete({
      where: { id: input.id },
    });
  }),

  toggleActive: adminProcedure.input(tryoutIdSchema).mutation(async ({ ctx, input }) => {
    const tryout = await ctx.db.tryout.findUnique({
      where: { id: input.id },
      select: { isActive: true },
    });

    if (!tryout) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Tryout not found',
      });
    }

    return ctx.db.tryout.update({
      where: { id: input.id },
      data: { isActive: !tryout.isActive },
    });
  }),

  getAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.tryout.findMany({
      include: {
        course: {
          select: { title: true, classCode: true },
        },
        _count: {
          select: { questions: true, attempts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }),

  getDetailedById: adminProcedure.input(tryoutIdSchema).query(async ({ ctx, input }) => {
    const tryout = await ctx.db.tryout.findUnique({
      where: { id: input.id },
      include: {
        questions: {
          include: {
            options: {
              orderBy: { order: 'asc' },
            },
            _count: {
              select: { answers: true },
            },
          },
          orderBy: { order: 'asc' },
        },
        course: {
          select: {
            id: true,
            title: true,
            classCode: true,
            members: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        attempts: {
          include: {
            user: {
              select: { id: true, name: true, email: true, nim: true },
            },
            answers: {
              include: {
                question: {
                  select: { question: true, points: true },
                },
              },
            },
          },
          orderBy: { startedAt: 'desc' },
        },
        _count: {
          select: {
            attempts: true,
            questions: true,
          },
        },
      },
    });

    if (!tryout) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Tryout not found',
      });
    }

    const completedAttempts = tryout.attempts.filter((a) => a.isCompleted);
    const averageScore =
      completedAttempts.length > 0
        ? completedAttempts.reduce(
          (sum, attempt) => sum + (attempt.score / attempt.maxScore) * 100,
          0,
        ) / completedAttempts.length
        : 0;

    const highestScore =
      completedAttempts.length > 0
        ? Math.max(...completedAttempts.map((a) => (a.score / a.maxScore) * 100))
        : 0;

    const lowestScore =
      completedAttempts.length > 0
        ? Math.min(...completedAttempts.map((a) => (a.score / a.maxScore) * 100))
        : 0;

    return {
      ...tryout,
      statistics: {
        totalAttempts: tryout.attempts.length,
        completedAttempts: completedAttempts.length,
        averageScore: Math.round(averageScore * 100) / 100,
        highestScore: Math.round(highestScore * 100) / 100,
        lowestScore: Math.round(lowestScore * 100) / 100,
      },
    };
  }),

  getForEdit: adminProcedure.input(tryoutIdSchema).query(async ({ ctx, input }) => {
    const tryout = await ctx.db.tryout.findUnique({
      where: { id: input.id },
      include: {
        questions: {
          include: {
            options: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
        course: {
          select: { id: true, title: true, classCode: true },
        },
      },
    });

    if (!tryout) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Tryout not found',
      });
    }

    return tryout;
  }),

  duplicate: adminProcedure.input(tryoutIdSchema).mutation(async ({ ctx, input }) => {
    const originalTryout = await ctx.db.tryout.findUnique({
      where: { id: input.id },
      include: {
        questions: {
          include: {
            options: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });


    if (!originalTryout) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Tryout not found',
      });
    }


    console.log("originalTryout: ", originalTryout)

    return ctx.db.$transaction(async (tx) => {
      const newTryoutId = createId();

      await tx.tryout.create({
        data: {
          id: newTryoutId,
          title: `${originalTryout.title} (Copy)`,
          description: originalTryout.description,
          duration: originalTryout.duration,
          courseId: originalTryout.courseId,
          isActive: false,
        },
      });

      const questionData: any[] = [];
      const optionData: any[] = [];

      originalTryout?.questions.forEach((q, index) => {
        const newQuestionId = createId();
        questionData.push({
          id: newQuestionId,
          tryoutId: newTryoutId,
          type: q.type,
          question: q.question,
          points: q.points,
          required: q.required,
          order: index + 1,
          explanation: q.explanation,
          shortAnswers: q.shortAnswers,
          images: q.images,
          explanationImages: q.explanationImages,
        });
        if (q.options && q.options.length > 0) {
          q.options.forEach((opt, optIndex) => {
            optionData.push({
              id: createId(),
              questionId: newQuestionId,
              text: opt.text,
              isCorrect: opt.isCorrect,
              explanation: opt.explanation,
              order: optIndex + 1,
              images: opt.images,
            });
          });
        }
      })

      if (questionData.length > 0) {
        await tx.question.createMany({ data: questionData })
      }
      if (optionData.length > 0) {
        await tx.questionOption.createMany({ data: optionData });
      }

      return tx.tryout.findUnique({
        where: { id: newTryoutId },
        include: {
          questions: {
            include: { options: true },
            orderBy: { order: 'asc' },
          },
          course: {
            select: { title: true, classCode: true },
          },
        },
      });
    })
  }),

  getAttemptDetails: adminProcedure
    .input(z.object({ attemptId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const attempt = await ctx.db.userAttempt.findUnique({
        where: { id: input.attemptId },
        include: {
          user: {
            select: { id: true, name: true, email: true, nim: true },
          },
          tryout: {
            select: { id: true, title: true, duration: true },
          },
          answers: {
            include: {
              question: {
                include: {
                  options: true,
                },
              },
            },
          },
        },
      });

      if (!attempt) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Attempt not found',
        });
      }

      return attempt;
    }),
});
