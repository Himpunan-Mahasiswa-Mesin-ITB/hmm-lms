import type { CollectionConfig } from 'payload';

import { authenticated } from '../access/authenticated';
import { authenticatedOrPublished } from '../access/authenticatedOrPublished';

export const ExternalContact: CollectionConfig<'external-contact'> = {
  slug: 'external-contact',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['email', 'updatedAt'],
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'email',
      type: 'text',
      required: true,
      label: 'Email',
      admin: {
        description: 'Contact email address',
      },
    },
    {
      name: 'instagramUrl',
      type: 'text',
      label: 'Instagram URL',
      admin: {
        description: 'Official Instagram URL',
      },
    },
    {
      name: 'tiktokUrl',
      type: 'text',
      label: 'TikTok URL',
      admin: {
        description: 'Official TikTok URL',
      },
    },
    {
      name: 'lineUrl',
      type: 'text',
      label: 'LINE URL',
      admin: {
        description: 'Official LINE URL',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Active',
      defaultValue: true,
      admin: {
        description: 'Only active contact info will be used',
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
