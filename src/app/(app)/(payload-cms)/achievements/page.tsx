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

  const achievements = await payload.find({
    collection: 'achievements',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      competitionName: true,
      awardLevel: true,
      customAwardLevel: true,
      achievementDate: true,
      featuredImage: true,
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
          <h1>Achievements</h1>
        </div>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="achievements"
          currentPage={achievements.page}
          limit={12}
          totalDocs={achievements.totalDocs}
        />
      </div>

      <CollectionArchive posts={achievements.docs} relationTo="achievements" />

      <div className="container">
        {achievements.totalPages > 1 && achievements.page && (
          <Pagination page={achievements.page} totalPages={achievements.totalPages} />
        )}
      </div>
    </div>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: `Achievements - HMM`,
  };
}
