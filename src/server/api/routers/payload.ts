import { TRPCError } from '@trpc/server';
import { getPayload } from 'payload';
import { z } from 'zod';

import config from '~/payload.config';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const payloadRouter = createTRPCRouter({
  getPosts: publicProcedure.query(async () => {
    const payloadConfig = await config;
    const payload = await getPayload({
      config: payloadConfig,
    });

    const posts = await payload.find({
      collection: 'posts',
      where: {
        status: {
          equals: 'published',
        },
      },
      sort: '-publishedAt',
    });

    return posts;
  }),
  getPost: publicProcedure
    .input(
      z.object({
        slug: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const slug = input.slug;
      const payloadConfig = await config;
      const payload = await getPayload({
        config: payloadConfig,
      });

      const post = await payload.find({
        collection: 'posts',
        where: {
          slug: {
            equals: slug,
          },
          status: {
            equals: 'published',
          },
        },
      });
      if (!post.docs || post.docs.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Post not found',
        });
      }
      return post.docs[0];
    }),
  getAchievements: publicProcedure.query(async () => {
    const payloadConfig = await config;
    const payload = await getPayload({
      config: payloadConfig,
    });

    const achievements = await payload.find({
      collection: 'achievements',
      where: {
        status: {
          equals: 'published',
        },
      },
      sort: '-achievementDate',
    });

    return achievements;
  }),
  getAchievement: publicProcedure
    .input(
      z.object({
        slug: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const slug = input.slug;
      const payloadConfig = await config;
      const payload = await getPayload({
        config: payloadConfig,
      });

      const achievement = await payload.find({
        collection: 'achievements',
        where: {
          slug: {
            equals: slug,
          },
          status: {
            equals: 'published',
          },
        },
      });
      if (!achievement.docs || achievement.docs.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Achievement not found',
        });
      }
      return achievement.docs[0];
    }),
  getNews: publicProcedure.query(async () => {
    const payloadConfig = await config;
    const payload = await getPayload({
      config: payloadConfig,
    });

    const news = await payload.find({
      collection: 'news',
      where: {
        status: {
          equals: 'published',
        },
      },
      sort: '-publishedAt',
    });

    return news;
  }),
  getNewsItem: publicProcedure
    .input(
      z.object({
        slug: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const slug = input.slug;
      const payloadConfig = await config;
      const payload = await getPayload({
        config: payloadConfig,
      });

      const newsItem = await payload.find({
        collection: 'news',
        where: {
          slug: {
            equals: slug,
          },
          status: {
            equals: 'published',
          },
        },
      });
      if (!newsItem.docs || newsItem.docs.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'News not found',
        });
      }
      return newsItem.docs[0];
    }),
  getEvents: publicProcedure.query(async () => {
    const payloadConfig = await config;
    const payload = await getPayload({
      config: payloadConfig,
    });

    const events = await payload.find({
      collection: 'events',
      where: {
        status: {
          equals: 'published',
        },
      },
      sort: 'eventDate',
    });

    return events;
  }),
  getEvent: publicProcedure
    .input(
      z.object({
        slug: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const slug = input.slug;
      const payloadConfig = await config;
      const payload = await getPayload({
        config: payloadConfig,
      });

      const event = await payload.find({
        collection: 'events',
        where: {
          slug: {
            equals: slug,
          },
          status: {
            equals: 'published',
          },
        },
      });
      if (!event.docs || event.docs.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event not found',
        });
      }
      return event.docs[0];
    }),
  getExternalGallery: publicProcedure.query(async () => {
    const payloadConfig = await config;
    const payload = await getPayload({
      config: payloadConfig,
    });

    const gallery = await payload.find({
      collection: 'externalGallery',
      where: {
        status: {
          equals: 'published',
        },
      },
      sort: '-publishedAt',
    });

    return gallery;
  }),
  getExternalGalleryItem: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const id = input.id;
      const payloadConfig = await config;
      const payload = await getPayload({
        config: payloadConfig,
      });

      const galleryItem = await payload.find({
        collection: 'externalGallery',
        where: {
          id: {
            equals: id,
          },
          status: {
            equals: 'published',
          },
        },
      });
      if (!galleryItem.docs || galleryItem.docs.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Gallery item not found',
        });
      }
      return galleryItem.docs[0];
    }),
  getExternalContact: publicProcedure.query(async () => {
    const payloadConfig = await config;
    const payload = await getPayload({
      config: payloadConfig,
    });

    const contact = await payload.find({
      collection: 'external-contact',
      where: {
        isActive: {
          equals: true,
        },
      },
      limit: 1,
    });

    return contact.docs?.[0] || null;
  }),
});
