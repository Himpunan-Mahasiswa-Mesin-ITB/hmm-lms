import type { RequiredDataFromCollectionSlug } from 'payload';

import type { Media, User } from '~/payload-types';

export type EventArgs = {
  featuredImage: Media;
  author: User;
};

export const event1: (args: EventArgs) => RequiredDataFromCollectionSlug<'events'> = ({
  featuredImage,
  author,
}) => {
  return {
    slug: 'tech-summit-2026',
    _status: 'published',
    authors: [author],
    content: {
      root: {
        type: 'root',
        children: [
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Join us for the most anticipated technology conference of the year!',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            tag: 'h2',
            version: 1,
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'The 2026 Technology Summit brings together industry leaders, innovators, and enthusiasts from around the world. This year\'s theme focuses on the convergence of artificial intelligence, sustainable technology, and human-centered design.',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'What to Expect',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            tag: 'h3',
            version: 1,
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 1,
                mode: 'normal',
                style: '',
                text: 'Keynote Speakers',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Hear from leading experts in AI, robotics, and sustainable technology as they share their insights and visions for the future.',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 1,
                mode: 'normal',
                style: '',
                text: 'Workshops & Networking',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Participate in hands-on workshops and connect with fellow attendees during our networking sessions and social events.',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
    eventDate: '2026-09-15T09:00:00.000Z',
    eventEndDate: '2026-09-17T18:00:00.000Z',
    category: 'Technology Conference',
    location: 'Gedung Labtek II ITB / Zoom Meeting',
    excerpt: 'The 2026 Technology Summit brings together industry leaders, innovators, and enthusiasts from around the world.',
    featuredImage: featuredImage.id,
    tags: [
      { tag: 'technology' },
      { tag: 'conference' },
      { tag: 'AI' },
      { tag: 'networking' },
    ],
    meta: {
      description: 'The 2026 Technology Summit brings together industry leaders, innovators, and enthusiasts from around the world.',
      image: featuredImage.id,
      title: 'Tech Summit 2026',
    },
    title: 'Tech Summit 2026',
  };
};
