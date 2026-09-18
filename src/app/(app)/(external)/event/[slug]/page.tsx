import configPromise from '@payload-config';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Clock, MapPin, Tag } from 'lucide-react';
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
import { HmmExternalNavbar } from '../../hmm-external-navbar';
import PageClient from './page.client';

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise });
  const events = await payload.find({
    collection: 'events',
    draft: false,
    limit: 1000,
    pagination: false,
  });

  return events.docs.map(({ slug }) => ({ slug }));
}

type Args = {
  params: Promise<{
    slug?: string;
  }>;
};

export default async function Event({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode();
  const { slug = '' } = await paramsPromise;
  const decodedSlug = decodeURIComponent(slug);
  const url = '/event/' + decodedSlug;
  const event = await queryEventBySlug({ slug: decodedSlug });

  if (!event) return <PayloadRedirects url={url} />;

  const authors = Array.isArray(event.authors)
    ? event.authors
      .map((a) => (typeof a === 'object' ? a : null))
      .filter((a): a is NonNullable<typeof a> => a !== null)
    : [];

  const featuredImageUrl =
    typeof event.featuredImage === 'object' && event.featuredImage?.url
      ? event.featuredImage.url
      : null;

  const tags = Array.isArray(event.tags) ? event.tags : [];

  return (
    <>
      <HmmExternalNavbar />
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
                href="/event"
                className="hmm-sans mb-4 inline-flex w-fit items-center gap-2 text-xs font-bold tracking-[0.12em] text-white/75 uppercase transition hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Events
              </Link>
              {event.category && (
                <span className="hmm-sans inline-flex w-fit items-center rounded-full border border-white/25 px-2.5 py-0.5 text-[0.62rem] font-bold tracking-[0.1em] text-white/80 uppercase">
                  {event.category}
                </span>
              )}
              <h1 className="hmm-type-section mt-3 text-balance text-white">{event.title}</h1>
              <div className="hmm-sans mt-4 flex flex-wrap items-center gap-4 text-sm text-white/75">
                {event.eventDate && (
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(event.eventDate), 'MMMM d, yyyy')}
                  </span>
                )}
                {event.eventEndDate && (
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {format(new Date(event.eventEndDate), 'MMMM d, yyyy')}
                  </span>
                )}
                {event.location && (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {event.location}
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
                      className="hmm-sans rounded-full border border-white/20 px-2.5 py-0.5 text-xs font-bold tracking-[0.08em] text-white/70 capitalize"
                    >
                      {tag.tag}
                    </span>
                  ))}
                </div>
              )}

              {event.excerpt && (
                <p className="hmm-type-lede mb-8 max-w-none text-white/80">
                  {event.excerpt}
                </p>
              )}

              <RichText data={event.content} />
            </div>
          </section>
        </article>

        <ExternalLandingFooter />
      </main>
    </>
  );
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise;
  const decodedSlug = decodeURIComponent(slug);
  const eventItem = await queryEventBySlug({ slug: decodedSlug });

  return generateMeta({ doc: eventItem });
}

const queryEventBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode();

  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: 'events',
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
