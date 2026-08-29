import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  timestamps: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role', 'createdAt'],
  },
  access: {
    create: ({ req: { user } }) => {
      return user?.role === 'superadmin';
    },
    delete: ({ req: { user } }) => {
      return user?.role === 'superadmin';
    },
    update: ({ req: { user }, id }) => {
      if (!user) return false;

      if (user.role === 'superadmin') return true;

      // only update their own record for admin users
      return user.id === id;
    },
    // read: ({ req: { user } }) => {
    //   if (!user) return false;

    //   if (user.role === 'superadmin') return true;

    //   // only read their own record for admin users
    //   return {
    //     id: {
    //       equals: user.id,
    //     },
    //   };
    // },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Full Name',
      required: true,
      admin: {
        placeholder: 'John Doe',
      },
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'admin',
      required: true,
      access: {
        update: ({ req: { user } }) => user?.role === 'superadmin',
      },
      admin: {
        readOnly: true,
      },
      options: [
        {
          label: 'SUPERADMIN (Full Access)',
          value: 'superadmin',
        },
        {
          label: 'ADMIN (Edit Content)',
          value: 'admin',
        },
      ],
    },
    {
      name: 'prismaId',
      type: 'text',
      label: 'Prisma User ID',
      index: true,
      admin: {
        description: 'Linked User ID from the primary application database.',
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      label: 'Profile Picture',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Author Bio',
      admin: {
        description: 'Short bio to display on author pages or article footers.',
      },
    },
  ],
};
