import type { CollectionConfig } from 'payload';

import { populateAuthors } from './Posts/hooks/populateAuthors';

export const ExternalGallery: CollectionConfig<'externalGallery'> = {
  slug: 'externalGallery',
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
  },
  admin: {
    defaultColumns: ['title', 'description', 'publishedAt', 'status'],
    useAsTitle: 'title',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              label: 'Album Title',
              admin: {
                description: 'Title of the album',
              },
            },
            {
              name: 'albumImage',
              type: 'upload',
              relationTo: 'media',
              required: true,
              label: 'Album Image',
              admin: {
                description: 'Image of the album',
              },
            },
          ],
          label: 'Content',
        },
        {
          fields: [
            {
              name: 'description',
              type: 'text',
              label: 'Description',
              required: true,
              admin: {
                description: 'Description of the album',
              },
            },
            {
              name: 'tags',
              type: 'array',
              label: 'Tags',
              admin: {
                description: 'Add tags or categories for this news',
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
            {
              name: 'googleDriveLink',
              type: 'text',
              label: 'Google Drive Link',
              required: true,
              admin: {
                description: 'Link to the Google Drive for the album',
              },
            },
          ],
          label: 'Album Details',
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
