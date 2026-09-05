import type { CollectionConfig } from 'payload';

import { authenticated } from '../access/authenticated';
import { authenticatedOrPublished } from '../access/authenticatedOrPublished';

export const ExternalManifesto: CollectionConfig<'external-manifesto'> = {
  slug: 'external-manifesto',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['punch', 'updatedAt'],
    useAsTitle: 'punch',
  },
  fields: [
    {
      name: 'punch',
      type: 'text',
      required: true,
      label: 'Punch Line',
      admin: {
        description: 'Three-beat punch line (IG-style)',
      },
    },
    {
      name: 'support',
      type: 'textarea',
      required: true,
      label: 'Support Text',
      admin: {
        description: 'Supporting text for the manifesto',
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Hero Image',
      admin: {
        description: 'Full-bleed manifesto/hero image',
      },
    },
    {
      name: 'kabinetName',
      type: 'text',
      required: true,
      label: 'Cabinet Name',
      defaultValue: 'Pionir Berkarya',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Active',
      defaultValue: true,
      admin: {
        description: 'Only one manifesto should be active at a time',
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
