import type { CollectionConfig } from 'payload';

import { authenticated } from '../access/authenticated';
import { authenticatedOrPublished } from '../access/authenticatedOrPublished';

export const ExternalPillar: CollectionConfig<'external-pillar'> = {
  slug: 'external-pillar',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['key', 'title', 'kicker', 'updatedAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      required: true,
      label: 'Key',
      admin: {
        description: 'Unique key for the pillar (e.g., study, society, solidarity)',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Title',
    },
    {
      name: 'kicker',
      type: 'text',
      required: true,
      label: 'Kicker',
      admin: {
        description: 'Short descriptor or subtitle',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      label: 'Description',
      admin: {
        description: 'Detailed description of the pillar',
      },
    },
    {
      name: 'variant',
      type: 'select',
      required: true,
      label: 'Layout Variant',
      options: [
        { label: 'Split Layout', value: 'split' },
        { label: 'Society Layout', value: 'society' },
        { label: 'Solidarity Layout', value: 'solidarity' },
      ],
      defaultValue: 'split',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Image',
      required: true,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Active',
      defaultValue: true,
      admin: {
        description: 'Only active pillars will be displayed',
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
