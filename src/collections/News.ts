import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields';
import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical';
import type { CollectionConfig } from 'payload';
import { slugField } from 'payload';

import { Banner } from '../blocks/Banner/config';
import { Code } from '../blocks/Code/config';
import { MediaBlock } from '../blocks/MediaBlock/config';
import { generatePreviewPath } from '../utilities/generatePreviewPath';
import { populateAuthors } from './Posts/hooks/populateAuthors';

export const News: CollectionConfig<'news'> = {
  slug: 'news',
  access: {
    read: () => true,
    create: ({ req }) => {
      if (req.user?.role === 'superadmin' || req.user?.role === 'admin') {
        return true;
      }
      return false;
    },
    update: ({ req }) => {
      if (req.user?.role === 'superadmin' || req.user?.role === 'admin') {
        return true;
      }
      return false;
    },
    delete: ({ req }) => {
      if (req.user?.role === 'superadmin' || req.user?.role === 'admin') {
        return true;
      }
      return false;
    },
  },
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'publishedAt', 'status'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'news',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'news',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'News Title',
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'featuredImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Cover Image',
            },
            {
              name: 'content',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ];
                },
              }),
              label: 'Full Article Body',
              required: true,
            },
          ],
          label: 'Content',
        },
        {
          fields: [
            {
              name: 'summary',
              type: 'textarea',
              label: 'Executive Summary',
              required: true,
              admin: {
                description: 'Short snippet used for social previews and card teasers',
              },
            },
            {
              name: 'tags',
              type: 'array',
              label: 'Tags',
              admin: {
                description: 'Add custom keywords or categories for this news',
              },
              fields: [
                {
                  name: 'tag',
                  type: 'text',
                  required: true,
                  label: 'Tag Name',
                },
              ],
            },
          ],
          label: 'News Details',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),
            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date();
            }
            return value;
          },
        ],
      },
    },
    {
      name: 'authors',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'users',
      label: 'Authors',
    },
    {
      name: 'status',
      type: 'select',
      label: 'Publishing Status',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'populatedAuthors',
      type: 'array',
      access: {
        update: () => false,
      },
      admin: {
        disabled: true,
        readOnly: true,
      },
      fields: [
        {
          name: 'id',
          type: 'text',
        },
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
    slugField(),
  ],
  hooks: {
    afterRead: [populateAuthors],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
};
