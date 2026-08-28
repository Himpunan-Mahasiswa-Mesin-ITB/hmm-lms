import type { RequiredDataFromCollectionSlug } from 'payload';

import type { Media, User } from '~/payload-types';

export type NewsArgs = {
  featuredImage: Media;
  author: User;
};

export const news1: (args: NewsArgs) => RequiredDataFromCollectionSlug<'news'> = ({
  featuredImage,
  author,
}) => {
  return {
    slug: 'hmm-wins-national-competition',
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
                text: 'HMM Robotics Team Achieves Historic Victory',
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
                text: 'The HMM Robotics Team has secured first place at the prestigious Indonesian National Robotics Competition 2026, marking a significant milestone in the team\'s history.',
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
                text: 'Competition Overview',
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
                text: 'The national competition brought together 50 university teams from across Indonesia, competing in various categories including autonomous navigation, obstacle avoidance, and task completion challenges.',
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
                text: 'Team Achievement',
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
                text: 'After months of preparation and innovation, the HMM team demonstrated exceptional technical skills and teamwork throughout the competition. Their robot successfully completed all challenges with the highest accuracy score.',
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
    featuredImage: featuredImage.id,
    summary: 'The HMM Robotics Team has secured first place at the prestigious Indonesian National Robotics Competition 2026, marking a significant milestone in the team\'s history.',
    tags: [
      { tag: 'robotics' },
      { tag: 'competition' },
      { tag: 'achievement' },
      { tag: 'national' },
    ],
    meta: {
      description: 'The HMM Robotics Team has secured first place at the prestigious Indonesian National Robotics Competition 2026.',
      image: featuredImage.id,
      title: 'HMM Wins National Competition',
    },
    title: 'HMM Robotics Team Achieves Historic Victory',
  };
};
