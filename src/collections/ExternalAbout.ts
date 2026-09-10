import type { CollectionConfig } from 'payload';

import { authenticated } from '../access/authenticated';
import { authenticatedOrPublished } from '../access/authenticatedOrPublished';

export const ExternalAbout: CollectionConfig<'external-about'> = {
  slug: 'external-about',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['kabinetName', 'headingPrefix', 'updatedAt'],
    useAsTitle: 'kabinetName',
  },
  fields: [
    {
      name: 'kabinetName',
      type: 'text',
      required: true,
      label: 'Cabinet Name',
      defaultValue: 'Pionir Berkarya',
    },
    {
      name: 'headingPrefix',
      type: 'text',
      required: true,
      label: 'Heading Prefix',
      admin: {
        description: 'First clause styled bold italic in the hero',
      },
    },
    {
      name: 'headingSuffix',
      type: 'text',
      required: true,
      label: 'Heading Suffix',
    },
    {
      name: 'lead',
      type: 'textarea',
      required: true,
      label: 'Lead Text',
      admin: {
        description: 'Short hero line below the title',
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Hero Image',
      admin: {
        description: 'About hero wallpaper',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Active',
      defaultValue: true,
      admin: {
        description: 'Only one about section should be active at a time',
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
