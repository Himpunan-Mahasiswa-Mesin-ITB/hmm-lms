import type { CollectionConfig } from 'payload';

import { authenticated } from '../access/authenticated';
import { authenticatedOrPublished } from '../access/authenticatedOrPublished';

export const ExternalOrganogram: CollectionConfig<'external-organogram'> = {
  slug: 'external-organogram',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'type', 'updatedAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Title',
      admin: {
        description: 'Department/Bureau/Division name',
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
      name: 'isPrince',
      type: 'checkbox',
      label: 'Current Prince',
      defaultValue: false,
      admin: {
        description:
          'Mark as the current Prince of the cabinet/organization (will always appear first)',
      },
    },
    {
      name: 'detailType',
      type: 'select',
      required: true,
      label: 'Detail Type',
      options: [
        { label: 'Featured (with tagline and paragraphs)', value: 'featured' },
        { label: 'Roster (role and name list)', value: 'roster' },
      ],
      defaultValue: 'featured',
    },
    {
      name: 'featuredDetail',
      type: 'group',
      label: 'Featured Detail',
      admin: {
        condition: (data) => data.detailType === 'featured',
      },
      fields: [
        {
          name: 'tagline',
          type: 'text',
          label: 'Tagline',
        },
        {
          name: 'paragraphs',
          type: 'array',
          label: 'Paragraphs',
          fields: [
            {
              name: 'paragraph',
              type: 'textarea',
              required: true,
              label: 'Paragraph Text',
            },
          ],
        },
        {
          name: 'people',
          type: 'array',
          label: 'People',
          fields: [
            {
              name: 'role',
              type: 'text',
              required: true,
              label: 'Role',
            },
            {
              name: 'name',
              type: 'text',
              required: true,
              label: 'Name',
            },
          ],
        },
      ],
    },
    {
      name: 'rosterDetail',
      type: 'group',
      label: 'Roster Detail',
      admin: {
        condition: (data) => data.detailType === 'roster',
      },
      fields: [
        {
          name: 'rows',
          type: 'array',
          label: 'Roster Rows',
          fields: [
            {
              name: 'role',
              type: 'text',
              required: true,
              label: 'Role',
            },
            {
              name: 'name',
              type: 'text',
              required: true,
              label: 'Name',
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
        description: 'Only active organogram items will be displayed',
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
