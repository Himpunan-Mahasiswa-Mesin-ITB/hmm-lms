import type { RequiredDataFromCollectionSlug } from 'payload';

import type { Media, User } from '~/payload-types';

export type AchievementArgs = {
  featuredImage: Media;
  author: User;
};

export const achievement1: (args: AchievementArgs) => RequiredDataFromCollectionSlug<'achievements'> = ({
  featuredImage,
  author,
}) => {
  return {
    slug: 'national-robotics-champion-2026',
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
                text: 'Indonesian National Robotics Competition 2026',
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
                text: 'Our team competed against 50 university teams from across Indonesia and emerged as the national champion in the autonomous robotics category.',
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
                text: 'Project Description',
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
                text: 'The team developed an autonomous robot capable of navigating complex obstacle courses, identifying objects, and performing precise manipulation tasks. The project involved advanced computer vision, path planning algorithms, and real-time control systems.',
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
    competitionName: 'Indonesian National Robotics Competition 2026',
    awardLevel: 'juara_1',
    achievementDate: '2026-08-15T00:00:00.000Z',
    featuredImage: featuredImage.id,
    teamMembers: [
      { memberName: 'Ahmad Rizky', nim: '13123001' },
      { memberName: 'Budi Santoso', nim: '13123002' },
      { memberName: 'Citra Dewi', nim: '13123003' },
      { memberName: 'Dimas Pratama', nim: '13123004' },
    ],
    tags: [
      { tag: 'robotics' },
      { tag: 'national' },
      { tag: 'champion' },
      { tag: 'autonomous' },
    ],
    meta: {
      description: 'Our team competed against 50 university teams from across Indonesia and emerged as the national champion.',
      image: featuredImage.id,
      title: 'National Robotics Champion 2026',
    },
    title: '1st Place - Indonesian National Robotics Competition 2026',
  };
};
