import type { CollectionConfig } from 'payload';

import { authenticated } from '../access/authenticated';
import { authenticatedOrPublished } from '../access/authenticatedOrPublished';

export const ExternalLogoMeaning: CollectionConfig<'external-logo-meaning'> = {
  slug: 'external-logo-meaning',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['key', 'title', 'updatedAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      required: true,
      label: 'Key',
      admin: {
        description: 'Unique identifier for the logo element (e.g., p, b, star, pawns)',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Title',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Image',
      required: true,
    },
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt Text',
      admin: {
        description: 'Alt text for accessibility',
      },
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
      label: 'Description',
      admin: {
        description: 'Description of the logo meaning (supports basic HTML)',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Active',
      defaultValue: true,
      admin: {
        description: 'Only active logo meanings will be displayed',
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
