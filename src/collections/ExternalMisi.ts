import type { CollectionConfig } from 'payload';

import { authenticated } from '../access/authenticated';
import { authenticatedOrPublished } from '../access/authenticatedOrPublished';

export const ExternalMisi: CollectionConfig<'external-misi'> = {
  slug: 'external-misi',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'updatedAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Title',
      defaultValue: 'Misi HMM',
    },
    {
      name: 'groups',
      type: 'array',
      label: 'Groups',
      fields: [
        {
          name: 'groupTitle',
          type: 'text',
          label: 'Group Title',
        },
        {
          name: 'missions',
          type: 'array',
          label: 'Missions',
          fields: [
            {
              name: 'cardTitle',
              type: 'text',
              required: true,
              label: 'Card Title',
            },
            {
              name: 'oneLiner',
              type: 'text',
              required: true,
              label: 'One-Liner',
              admin: {
                description: 'Short one-line description',
              },
            },
            {
              name: 'summary',
              type: 'text',
              required: true,
              label: 'Summary',
            },
            {
              name: 'body',
              type: 'textarea',
              required: true,
              label: 'Body',
              admin: {
                description: 'Detailed description of the mission',
              },
            },
            {
              name: 'isActive',
              type: 'checkbox',
              label: 'Active',
              defaultValue: true,
              admin: {
                description: 'Only active missions will be displayed',
              },
            },
            {
              name: 'order',
              type: 'number',
              label: 'Display Order',
              admin: {
                description: 'Lower numbers appear first',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Active',
      defaultValue: true,
      admin: {
        description: 'Only one mission section should be active at a time',
      },
    },
  ],
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
