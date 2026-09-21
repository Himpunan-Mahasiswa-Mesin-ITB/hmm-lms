import configPromise from '@payload-config';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Tag, Trophy, Users } from 'lucide-react';
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
  const achievements = await payload.find({
    collection: 'achievements',
    draft: false,
    limit: 1000,
    pagination: false,
  });

  return achievements.docs.map(({ slug }) => ({ slug }));
}

const awardLevelLabels: Record<string, string> = {
  juara_1: '1st Place',
  juara_2: '2nd Place',
  juara_3: '3rd Place',
  honorable_mention: 'Honorable Mention',
  finalist: 'Finalist',
  special_award: 'Special Award',
};

type Args = {
  params: Promise<{
    slug?: string;
  }>;
};

export default async function Achievement({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode();
  const { slug = '' } = await paramsPromise;
  const decodedSlug = decodeURIComponent(slug);
  const url = '/achievements/' + decodedSlug;
  const achievement = await queryAchievementBySlug({ slug: decodedSlug });

  if (!achievement) return <PayloadRedirects url={url} />;

  const authors = Array.isArray(achievement.authors)
    ? achievement.authors
      .map((a) => (typeof a === 'object' ? a : null))
      .filter((a): a is NonNullable<typeof a> => a !== null)
    : [];

  const awardLabel =
    awardLevelLabels[achievement.awardLevel] ||
    achievement.customAwardLevel ||
    achievement.awardLevel;

  const featuredImageUrl =
    typeof achievement.featuredImage === 'object' && achievement.featuredImage?.url
      ? achievement.featuredImage.url
      : null;

  const tags = Array.isArray(achievement.tags) ? achievement.tags : [];
  const teamMembers = Array.isArray(achievement.teamMembers) ? achievement.teamMembers : [];

  return (
    <>
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
                href="/achievements"
                className="hmm-sans mb-4 inline-flex w-fit items-center gap-2 text-xs font-bold tracking-[0.12em] text-white/75 uppercase transition hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Achievements
              </Link>
              <span className="hmm-sans inline-flex w-fit items-center gap-1 rounded-full border border-[var(--color-hmm-yellow)]/50 bg-[color-mix(in_srgb,var(--color-hmm-yellow)_18%,transparent)] px-2.5 py-0.5 text-[0.62rem] font-bold tracking-[0.1em] text-[color-mix(in_srgb,var(--color-hmm-yellow)_78%,var(--color-hmm-cream))] uppercase">
                <Trophy className="h-3 w-3" />
                {awardLabel}
              </span>
              <h1 className="hmm-type-section mt-3 text-balance text-white">
                {achievement.title}
              </h1>
              <div className="hmm-sans mt-4 flex flex-wrap items-center gap-4 text-sm text-white/75">
                {achievement.achievementDate && (
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(achievement.achievementDate), 'MMMM d, yyyy')}
                  </span>
                )}
                {achievement.competitionName && (
                  <span className="inline-flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    {achievement.competitionName}
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

              {teamMembers.length > 0 && (
                <div className="mb-10">
                  <h3 className="hmm-type-subsection mb-4 flex items-center gap-2 text-white">
                    <Users className="h-5 w-5" />
                    Team Members
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {teamMembers.map((member, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-white/12 bg-white/3 p-3"
                      >
                        <p className="hmm-sans font-semibold text-white">
                          {member.memberName}
                        </p>
                        {member.nim && (
                          <p className="hmm-sans text-sm text-white/60">
                            NIM: {member.nim}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <RichText data={achievement.content} />
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
  const achievement = await queryAchievementBySlug({ slug: decodedSlug });

  return generateMeta({ doc: achievement });
}

const queryAchievementBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode();

  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: 'achievements',
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
