import configPromise from '@payload-config';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { getPayload } from 'payload';
import { cache } from 'react';

import { LivePreviewListener } from '~/payload/components/LivePreviewListener';
import { PayloadRedirects } from '~/payload/components/PayloadRedirects';
import RichText from '~/payload/components/RichText';
import { generateMeta } from '~/payload/utilities/generateMeta';

import { ExternalLandingFooter } from '../../external-landing-footer';
import PageClient from './page.client';

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise });
  const news = await payload.find({
    collection: 'news',
    draft: false,
    limit: 1000,
    pagination: false,
  });

  return news.docs.map(({ slug }) => ({ slug }));
}

type Args = {
  params: Promise<{
    slug?: string;
  }>;
};

export default async function News({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode();
  const { slug = '' } = await paramsPromise;
  const decodedSlug = decodeURIComponent(slug);
  const url = '/news/' + decodedSlug;
  const newsItem = await queryNewsBySlug({ slug: decodedSlug });

  if (!newsItem) return <PayloadRedirects url={url} />;

  const authors = Array.isArray(newsItem.authors)
    ? newsItem.authors
      .map((a) => (typeof a === 'object' ? a : null))
      .filter((a): a is NonNullable<typeof a> => a !== null)
    : [];

  const featuredImageUrl =
    typeof newsItem.featuredImage === 'object' && newsItem.featuredImage?.url
      ? newsItem.featuredImage.url
      : null;

  const tags = Array.isArray(newsItem.tags) ? newsItem.tags : [];

  return (
    <main className="hmm-sans text-[var(--color-hmm-navy)]">
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}

      <article>
        <section className="hmm-chapter-dark relative min-h-[52svh] scroll-mt-[4.5rem] overflow-hidden">
          {featuredImageUrl ? (
            <Image
              src={featuredImageUrl}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          ) : (
            <div className="hmm-grad-hero-burst absolute inset-0" aria-hidden />
          )}
          <div className="hmm-about-hero-overlay absolute inset-0" aria-hidden />
          <div className="hmm-about-hero-vignette absolute inset-0" aria-hidden />

          <div className="relative z-10 mx-auto flex min-h-[52svh] w-full max-w-[860px] flex-col justify-end px-4 pt-24 pb-12 sm:px-8 sm:pt-28">
            <Link
              href="/news"
              className="hmm-sans mb-4 inline-flex w-fit items-center gap-2 text-xs font-bold tracking-[0.12em] text-white/75 uppercase transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to News
            </Link>
            <div className="hmm-eyebrow-rule text-white/85">
              <p className="hmm-type-eyebrow text-[color-mix(in_srgb,var(--color-hmm-yellow)_62%,var(--color-hmm-cream))]">
                News
              </p>
            </div>
            <h1 className="hmm-type-section mt-3 text-balance text-white">{newsItem.title}</h1>
            <div className="hmm-sans mt-4 flex flex-wrap items-center gap-4 text-sm text-white/75">
              {newsItem.publishedAt && (
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(newsItem.publishedAt), 'MMMM d, yyyy')}
                </span>
              )}
              {authors.length > 0 && (
                <span>
                  {authors.length === 1
                    ? authors[0]?.name || authors[0]?.email
                    : `${authors.length} authors`}
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="hmm-chapter-dark px-4 py-[var(--hmm-section-y-md)] sm:px-8">
          <div className="mx-auto max-w-3xl">
            {tags.length > 0 && (
              <div className="mb-8 flex flex-wrap items-center gap-2">
                <Tag className="h-4 w-4" />
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="hmm-sans rounded-full border border-white/20 px-2.5 py-0.5 text-xs font-bold tracking-[0.08em] text-white/75 capitalize"
                  >
                    {tag.tag}
                  </span>
                ))}
              </div>
            )}

            {newsItem.summary && (
              <p className="hmm-type-lede mb-8 max-w-none text-white/80">
                {newsItem.summary}
              </p>
            )}

            <RichText data={newsItem.content} />
          </div>
        </section>
      </article>

      <ExternalLandingFooter />
    </main >
  );
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise;
  const decodedSlug = decodeURIComponent(slug);
  const newsItem = await queryNewsBySlug({ slug: decodedSlug });

  return generateMeta({ doc: newsItem });
}

const queryNewsBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode();

  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: 'news',
    draft,
    limit: 1,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  });

  return result.docs?.[0] || null;
});
