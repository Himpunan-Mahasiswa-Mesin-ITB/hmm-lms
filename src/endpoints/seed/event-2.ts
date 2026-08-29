import type { RequiredDataFromCollectionSlug } from 'payload';

import type { Media, User } from '~/payload-types';

export type EventArgs = {
  featuredImage: Media;
  author: User;
};

export const event2: (args: EventArgs) => RequiredDataFromCollectionSlug<'events'> = ({
  featuredImage,
  author,
}) => {
  return {
    slug: 'robotics-workshop',
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
                text: 'Hands-on Robotics Workshop',
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
                text: 'Learn the fundamentals of robotics in this intensive workshop designed for beginners and intermediate enthusiasts alike.',
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
                text: 'Workshop Topics',
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
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Introduction to robotic systems and components',
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
                text: 'Programming basics for robotics',
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
                text: 'Building your first robot project',
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
    eventDate: '2026-10-20T10:00:00.000Z',
    eventEndDate: '2026-10-20T16:00:00.000Z',
    category: 'Workshop',
    location: 'Engineering Building A, Room 305',
    excerpt: 'Learn the fundamentals of robotics in this intensive workshop designed for beginners and intermediate enthusiasts alike.',
    featuredImage: featuredImage.id,
    tags: [
      { tag: 'robotics' },
      { tag: 'workshop' },
      { tag: 'hands-on' },
      { tag: 'engineering' },
    ],
    meta: {
      description: 'Learn the fundamentals of robotics in this intensive workshop designed for beginners and intermediate enthusiasts alike.',
      image: featuredImage.id,
      title: 'Hands-on Robotics Workshop',
    },
    title: 'Hands-on Robotics Workshop',
  };
};
