import type { RequiredDataFromCollectionSlug } from 'payload';

import type { Media, User } from '~/payload-types';

export type NewsArgs = {
  featuredImage: Media;
  author: User;
};

export const news2: (args: NewsArgs) => RequiredDataFromCollectionSlug<'news'> = ({
  featuredImage,
  author,
}) => {
  return {
    slug: 'new-laboratory-facility',
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
                text: 'HMM Opens State-of-the-Art Robotics Laboratory',
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
                text: 'HMM is proud to announce the opening of its new robotics laboratory, equipped with cutting-edge technology and tools to support innovative research and development projects.',
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
                text: 'Laboratory Features',
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
                text: 'Advanced robotics testing platforms',
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
                text: '3D printing and prototyping equipment',
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
                text: 'Collaborative workspace for interdisciplinary projects',
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
    summary: 'HMM is proud to announce the opening of its new robotics laboratory, equipped with cutting-edge technology and tools to support innovative research and development projects.',
    tags: [
      { tag: 'laboratory' },
      { tag: 'infrastructure' },
      { tag: 'research' },
      { tag: 'innovation' },
    ],
    meta: {
      description: 'HMM is proud to announce the opening of its new robotics laboratory, equipped with cutting-edge technology and tools.',
      image: featuredImage.id,
      title: 'New Laboratory Facility',
    },
    title: 'HMM Opens State-of-the-Art Robotics Laboratory',
  };
};
