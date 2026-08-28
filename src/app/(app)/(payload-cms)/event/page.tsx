import configPromise from '@payload-config';
import type { Metadata } from 'next/types';
import { getPayload } from 'payload';

import { CollectionArchive } from '~/components/CollectionArchive';
import { PageRange } from '~/components/PageRange';
import { Pagination } from '~/components/Pagination';

import PageClient from './page.client';

export const dynamic = 'force-static';
export const revalidate = 600;

export default async function Page() {
  const payload = await getPayload({ config: configPromise });

  const events = await payload.find({
    collection: 'events',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      eventDate: true,
      category: true,
      location: true,
      authors: true,
      tags: true,
      meta: true,
    },
  });

  return (
    <div className="p-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Events</h1>
        </div>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="events"
          currentPage={events.page}
          limit={12}
          totalDocs={events.totalDocs}
        />
      </div>

      <CollectionArchive posts={events.docs} relationTo="event" />

      <div className="container">
        {events.totalPages > 1 && events.page && (
          <Pagination page={events.page} totalPages={events.totalPages} />
        )}
      </div>
    </div>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: `Events - HMM`,
  };
}
