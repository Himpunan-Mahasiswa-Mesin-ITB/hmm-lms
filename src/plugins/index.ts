import type { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types';
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs';
import { seoPlugin } from '@payloadcms/plugin-seo';
import { s3Storage } from '@payloadcms/storage-s3';
import type { Plugin } from 'payload';
import { env } from '~/env';
import { getServerSideURL } from '~/payload/utilities/getURL';
import type { News, Event, Achievement } from '~/payload-types';
// import { formBuilderPlugin } from '@payloadcms/plugin-form-builder';
// import { redirectsPlugin } from '@payloadcms/plugin-redirects';
// import { searchPlugin } from '@payloadcms/plugin-search';
// import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical';

// import { revalidateRedirects } from '~/hooks/revalidateRedirects';
// import { beforeSyncWithSearch } from '~/payload/search/beforeSync';
// import { searchFields } from '~/payload/search/fieldOverrides';

const generateTitle: GenerateTitle<News | Event | Achievement> = ({ doc }) =>
  doc?.title ? `${doc.title} | HMM ITB` : 'HMM ITB';

const generateURL: GenerateURL<News | Event | Achievement> = ({ doc }) => {
  const url = getServerSideURL();

  return doc?.slug ? `${url}/${doc.slug}` : url;
};

export const plugins: Plugin[] = [
  s3Storage({
    collections: {
      media: true,
    },
    enabled: true,
    bucket: env.DO_SPACES_BUCKET,
    config: {
      region: env.DO_SPACES_REGION,
      credentials: {
        accessKeyId: env.DO_SPACES_KEY,
        secretAccessKey: env.DO_SPACES_SECRET,
      },
      endpoint: env.DO_SPACES_ENDPOINT,
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  // formBuilderPlugin({
  //   fields: {
  //     payment: false,
  //   },
  //   formOverrides: {
  //     fields: ({ defaultFields }) =>
  //       defaultFields.map((field) => {
  //         if ('name' in field && field.name === 'confirmationMessage') {
  //           return {
  //             ...field,
  //             editor: lexicalEditor({
  //               features: ({ rootFeatures }) => [
  //                 ...rootFeatures,
  //                 FixedToolbarFeature(),
  //                 HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
  //               ],
  //             }),
  //           };
  //         }
  //         return field;
  //       }),
  //   },
  // }),
  // searchPlugin({
  //   beforeSync: beforeSyncWithSearch,
  //   collections: ['posts'],
  //   searchOverrides: {
  //     fields: ({ defaultFields }) => [...defaultFields, ...searchFields],
  //   },
  // }),
  // redirectsPlugin({
  //   collections: ['pages', 'posts'],
  //   overrides: {
  //     // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
  //     fields: ({ defaultFields }) =>
  //       defaultFields.map((field) => {
  //         if ('name' in field && field.name === 'from') {
  //           return {
  //             ...field,
  //             admin: {
  //               description: 'You will need to rebuild the website when changing this field.',
  //             },
  //           };
  //         }
  //         return field;
  //       }),
  //     hooks: {
  //       afterChange: [revalidateRedirects],
  //     },
  //   },
  // }),
];
