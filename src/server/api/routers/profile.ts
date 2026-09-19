import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  bpProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import z from "zod";

export const profileRouter = createTRPCRouter({
  createGroupProfile: bpProcedure.input(z.object({
    name: z.string(),
    description: z.string().optional(),
  })).mutation(async ({ input }) => {
    if (!input) throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Input data is required.",
    });

    await db.groupProfile.create({
      data: {
        name: input.name,
        description: input.description,
      }
    })
  }),
  createProfile: bpProcedure.input(z.object({
    name: z.string(),
    description: z.string().optional(),
  })).mutation(async ({ input }) => {
    if (!input) throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Input data is required.",
    });

    await db.profile.create({
      data: {
        name: input.name,
        description: input.description,
      }
    })
  }),
  updateGroupProfile: bpProcedure.input(z.object({
    groupId: z.string(),
    name: z.string(),
    description: z.string().optional(),
  })).mutation(async ({ input }) => {
    if (!input) throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Input data is required.",
    });

    const existingGroup = await db.groupProfile.findUnique({
      where: {
        id: input.groupId
      },
    })

    if (!existingGroup) throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No Group Profile is found.",
    });

    await db.groupProfile.update({
      where: {
        id: input.groupId
      },
      data: {
        name: input.name,
        description: input.description,
      }
    })
  }),
  updateProfile: bpProcedure.input(z.object({
    profileId: z.string(),
    name: z.string(),
    description: z.string().optional(),
  })).mutation(async ({ input }) => {
    if (!input) throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Input data is required.",
    });

    const existingProfile = await db.profile.findUnique({
      where: {
        id: input.profileId
      },
    })

    if (!existingProfile) throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No Profile is found.",
    });

    await db.profile.update({
      where: {
        id: input.profileId
      },
      data: {
        name: input.name,
        description: input.description,
      }
    })
  }),
  deleteGroupProfile: bpProcedure.input(z.object({
    groupId: z.string(),
  })).mutation(async ({ input }) => {
    if (!input) throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Input data is required.",
    });

    const existingGroup = await db.groupProfile.findUnique({
      where: {
        id: input.groupId
      },
    })

    if (!existingGroup) throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No Group Profile is found.",
    });

    await db.groupProfile.delete({
      where: {
        id: input.groupId
      }
    })
  }),
  deleteProfile: bpProcedure.input(z.object({
    profileId: z.string(),
  })).mutation(async ({ input }) => {
    if (!input) throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Input data is required.",
    });

    const existingProfile = await db.profile.findUnique({
      where: {
        id: input.profileId
      },
    })

    if (!existingProfile) throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No Profile is found.",
    });

    await db.profile.delete({
      where: {
        id: input.profileId
      }
    })
  }),
  createProfileProgress: bpProcedure.input(z.object({
    profileId: z.string(),
    userId: z.string(),
    progress: z.number(),
  })).mutation(async ({ input }) => {
    if (!input) throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Input data is required.",
    });
    await db.profileProgress.create({
      data: {
        progress: input.progress,
        userId: input.userId,
        profileId: input.profileId,
      }
    })
  }),
  updateProfileProgress: bpProcedure.input(z.object({
    profileId: z.string(),
    userId: z.string(),
    progress: z.number(),
  })).mutation(async ({ input }) => {
    if (!input) throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Input data is required.",
    });
    const existingProfile = await db.profileProgress.findUnique({
      where: {
        userId_profileId: {
          userId: input.userId,
          profileId: input.profileId
        }
      },
    })
    if (!existingProfile) throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No Profile Progress is found.",
    });

    await db.profileProgress.update({
      where: {
        userId_profileId: {
          userId: input.userId,
          profileId: input.profileId
        }
      },
      data: {
        progress: input.progress,
      }
    })
  }),
  deleteProfileProgress: bpProcedure.input(z.object({
    profileId: z.string(),
    userId: z.string(),
  })).mutation(async ({ input }) => {
    if (!input) throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Input data is required.",
    });
    const existingProfile = await db.profileProgress.findUnique({
      where: {
        userId_profileId: {
          userId: input.userId,
          profileId: input.profileId
        }
      },
    })
    if (!existingProfile) throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No Profile Progress is found.",
    });

    await db.profileProgress.delete({
      where: {
        userId_profileId: {
          userId: input.userId,
          profileId: input.profileId
        }
      },
    })
  })
});
