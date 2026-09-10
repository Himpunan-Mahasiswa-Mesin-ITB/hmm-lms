import type { CollectionConfig } from 'payload';

import { authenticated } from '../access/authenticated';
import { authenticatedOrPublished } from '../access/authenticatedOrPublished';

export const ExternalImage: CollectionConfig<'external-image'> = {
  slug: 'external-image',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['key', 'updatedAt'],
    useAsTitle: 'key',
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      required: true,
      label: 'Image Key',
      admin: {
        description: 'Unique key to reference this image (e.g., hero, pillarStudy, heritage)',
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
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Admin description for this image',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Active',
      defaultValue: true,
      admin: {
        description: 'Only active images will be used',
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
