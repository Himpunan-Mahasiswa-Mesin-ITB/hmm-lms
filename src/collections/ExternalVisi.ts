import type { CollectionConfig } from 'payload';

import { authenticated } from '../access/authenticated';
import { authenticatedOrPublished } from '../access/authenticatedOrPublished';

export const ExternalVisi: CollectionConfig<'external-visi'> = {
  slug: 'external-visi',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['heading', 'lead', 'updatedAt'],
    useAsTitle: 'heading',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      label: 'Heading',
      defaultValue: 'Visi HMM',
    },
    {
      name: 'lead',
      type: 'textarea',
      required: true,
      label: 'Lead Text',
      defaultValue: 'Pionir masa depan lewat karya & keprofesian.',
    },
    {
      name: 'tldr',
      type: 'textarea',
      required: true,
      label: 'TL;DR',
      admin: {
        description: 'Short summary of the vision',
      },
    },
    {
      name: 'inkubatorKarya',
      type: 'group',
      label: 'Inkubator Karya',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          label: 'Title',
          defaultValue: 'Inkubator karya & keprofesian',
        },
        {
          name: 'karya',
          type: 'group',
          label: 'Karya Section',
          fields: [
            {
              name: 'subtitle',
              type: 'text',
              required: true,
              label: 'Subtitle',
              defaultValue: 'Inkubator karya',
            },
            {
              name: 'lead',
              type: 'textarea',
              required: true,
              label: 'Lead',
              defaultValue: 'Kajian, lomba, karya masyarakat, keilmuan yang hidup.',
            },
            {
              name: 'body',
              type: 'textarea',
              required: true,
              label: 'Body',
              admin: {
                description: 'Detailed description of the karya incubator',
              },
            },
          ],
        },
        {
          name: 'keprofesian',
          type: 'group',
          label: 'Keprofesian Section',
          fields: [
            {
              name: 'subtitle',
              type: 'text',
              required: true,
              label: 'Subtitle',
              defaultValue: 'Inkubator keprofesian',
            },
            {
              name: 'lead',
              type: 'textarea',
              required: true,
              label: 'Lead',
              defaultValue: 'Karir terpersonalisasi, relevan, siap industri.',
            },
            {
              name: 'body',
              type: 'textarea',
              required: true,
              label: 'Body',
              admin: {
                description: 'Detailed description of the professional incubator',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Hero Image',
      admin: {
        description: 'Visi/inkubator dark chapter image (optional)',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Active',
      defaultValue: true,
      admin: {
        description: 'Only one vision section should be active at a time',
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
