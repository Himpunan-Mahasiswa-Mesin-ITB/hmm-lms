import type { CollectionConfig } from 'payload';

import { authenticated } from '../access/authenticated';
import { authenticatedOrPublished } from '../access/authenticatedOrPublished';

export const ExternalEditorialSpot: CollectionConfig<'external-editorial-spot'> = {
  slug: 'external-editorial-spot',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['id', 'tag', 'caption', 'bento', 'updatedAt'],
    useAsTitle: 'id',
  },
  fields: [
    {
      name: 'id',
      type: 'text',
      required: true,
      label: 'ID',
      admin: {
        description: 'Unique identifier for the editorial spot',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Image',
      required: true,
    },
    {
      name: 'tag',
      type: 'select',
      required: true,
      label: 'Tag',
      options: [
        { label: 'Study', value: 'Study' },
        { label: 'Society', value: 'Society' },
        { label: 'Solidarity', value: 'Solidarity' },
      ],
    },
    {
      name: 'caption',
      type: 'text',
      required: true,
      label: 'Caption',
    },
    {
      name: 'href',
      type: 'text',
      label: 'Link URL',
      admin: {
        description: 'Optional link for the editorial spot',
      },
    },
    {
      name: 'bento',
      type: 'select',
      required: true,
      label: 'Layout',
      options: [
        { label: 'Feature (2×2 on large screens)', value: 'feature' },
        { label: 'Default', value: 'default' },
      ],
      defaultValue: 'default',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Active',
      defaultValue: true,
      admin: {
        description: 'Only active spots will be displayed',
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
