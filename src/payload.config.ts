import path from 'path';
import { fileURLToPath } from 'url';

import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { buildConfig } from 'payload';
import sharp from 'sharp';

import { Achievements } from './collections/Achievements';
import { Categories } from './collections/Categories';
import { Events } from './collections/Events';
import { Media } from './collections/Media';
import { News } from './collections/News';
import { Pages } from './collections/Pages';
import { Users } from './collections/Users';
import { env } from './env';
import { Footer } from './Footer/config';
import { Header } from './Header/config';
import { plugins } from './plugins';
import { getServerSideURL } from './utilities/getURL';
import { Posts } from './collections/Posts';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  routes: {
    admin: '/admin-cms',
  },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['~/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['~/components/BeforeDashboard'],
    },
    meta: {
      title: 'Admin Payload CMS',
      titleSuffix: ' | HMM ITB',
      icons: [
        {
          rel: 'icon',
          type: 'image/png',
          url: '/favicon.ico',
        },
      ],
    },
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  collections: [Users, Media, Posts, Events, Achievements, News, Categories, Pages],
  editor: lexicalEditor(),
  secret: env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: env.DATABASE_URL || '',
    },
    schemaName: 'payload_cms',
    push: env.NODE_ENV === 'development' ? true : false,
    // push: false,
  }),
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  sharp,
  plugins,
});
