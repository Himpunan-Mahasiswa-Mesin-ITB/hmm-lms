import type { RequiredDataFromCollectionSlug } from 'payload';

import type { Media, User } from '~/payload-types';

export type AchievementArgs = {
  featuredImage: Media;
  author: User;
};

export const achievement2: (args: AchievementArgs) => RequiredDataFromCollectionSlug<'achievements'> = ({
  featuredImage,
  author,
}) => {
  return {
    slug: 'shell-eco-marathon-2026',
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
                text: 'Shell Eco-Marathon Asia 2026',
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
                text: 'The HMM team achieved 2nd place in the Urban Concept category at the prestigious Shell Eco-Marathon Asia 2026, competing against teams from across the Asia-Pacific region.',
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
                text: 'Vehicle Innovation',
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
                text: 'Our team designed and built an energy-efficient urban concept vehicle that achieved exceptional fuel economy while meeting all safety and performance requirements. The vehicle featured lightweight materials, aerodynamic design, and an optimized powertrain system.',
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
    competitionName: 'Shell Eco-Marathon Asia 2026',
    awardLevel: 'juara_2',
    achievementDate: '2026-07-20T00:00:00.000Z',
    featuredImage: featuredImage.id,
    teamMembers: [
      { memberName: 'Eko Wijaya', nim: '13123005' },
      { memberName: 'Fani Amalia', nim: '13123006' },
      { memberName: 'Gilang Ramadhan', nim: '13123007' },
      { memberName: 'Hana Putri', nim: '13123008' },
    ],
    tags: [
      { tag: 'eco-marathon' },
      { tag: 'automotive' },
      { tag: 'efficiency' },
      { tag: 'international' },
    ],
    meta: {
      description: 'The HMM team achieved 2nd place in the Urban Concept category at the prestigious Shell Eco-Marathon Asia 2026.',
      image: featuredImage.id,
      title: 'Shell Eco-Marathon 2026',
    },
    title: '2nd Place - Shell Eco-Marathon Asia 2026',
  };
};
