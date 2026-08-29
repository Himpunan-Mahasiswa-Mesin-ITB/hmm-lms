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

import { Banner } from '../payload/blocks/Banner/config';
import { Code } from '../payload/blocks/Code/config';
import { MediaBlock } from '../payload/blocks/MediaBlock/config';
import { generatePreviewPath } from '../payload/utilities/generatePreviewPath';
import { populateAuthors } from './Posts/hooks/populateAuthors';

export const Achievements: CollectionConfig<'achievements'> = {
  slug: 'achievements',
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
    defaultColumns: ['title', 'competitionName', 'awardLevel', 'achievementDate', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'achievements',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'achievements',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Achievement Title',
      admin: {
        placeholder: 'e.g., 1st Place at Indonesian Rocket Competition 2026',
      },
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
              label: 'Trophy / Team Photo',
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
              label: 'Full Story & Project Description',
              required: true,
            },
          ],
          label: 'Content',
        },
        {
          fields: [
            {
              name: 'competitionName',
              type: 'text',
              label: 'Competition / Contest Name',
              required: true,
              admin: {
                placeholder: 'e.g., Shell Eco-marathon / KMHE / KTI Nasional',
              },
            },
            {
              name: 'awardLevel',
              type: 'select',
              label: 'Award Level',
              required: true,
              options: [
                { label: '1st Place (Juara 1)', value: 'juara_1' },
                { label: '2nd Place (Juara 2)', value: 'juara_2' },
                { label: '3rd Place (Juara 3)', value: 'juara_3' },
                { label: 'Honorable Mention', value: 'honorable_mention' },
                { label: 'Finalist', value: 'finalist' },
                { label: 'Special Award', value: 'special_award' },
                { label: 'Other', value: 'otherAwardLevel' },
              ],
            },
            {
              name: 'customAwardLevel',
              type: 'text',
              label: 'Specify Award Level',
              admin: {
                condition: (data) => data?.awardLevel === 'otherAwardLevel',
              },
            },
            {
              name: 'achievementDate',
              type: 'date',
              label: 'Date Awarded',
              required: true,
              admin: {
                date: {
                  pickerAppearance: 'dayAndTime',
                },
              },
            },
            {
              name: 'teamMembers',
              type: 'array',
              label: 'Team Members & NIMs',
              admin: {
                description: 'List students who won the award',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'memberName',
                      type: 'text',
                      label: 'Student Name',
                      required: true,
                    },
                    {
                      name: 'nim',
                      type: 'text',
                      label: 'NIM',
                      admin: {
                        placeholder: '13123000',
                      },
                    },
                  ],
                },
              ],
            },
            {
              name: 'tags',
              type: 'array',
              label: 'Tags',
              admin: {
                description: 'Add custom keywords or categories for this achievement',
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
          label: 'Achievement Details',
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
