import type { CollectionConfig } from 'payload';

import { authenticated } from '../access/authenticated';
import { authenticatedOrPublished } from '../access/authenticatedOrPublished';

export const ExternalHeritageTimeline: CollectionConfig<'external-heritage-timeline'> = {
  slug: 'external-heritage-timeline',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['year', 'title', 'updatedAt'],
    useAsTitle: 'year',
  },
  fields: [
    {
      name: 'year',
      type: 'text',
      required: true,
      label: 'Year',
      admin: {
        description: 'Year or time period',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Title',
    },
    {
      name: 'text',
      type: 'textarea',
      required: true,
      label: 'Description',
      admin: {
        description: 'Detailed description of the event',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Active',
      defaultValue: true,
      admin: {
        description: 'Only active timeline items will be displayed',
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
