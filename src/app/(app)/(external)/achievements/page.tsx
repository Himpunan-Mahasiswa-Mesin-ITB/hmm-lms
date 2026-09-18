import { format } from 'date-fns';
import { Calendar, Tag, Trophy } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { api } from '~/trpc/server';

import { ExternalLandingFooter } from '../external-landing-footer';
import { HmmExternalNavbar } from '../hmm-external-navbar';
import PageClient from './page.client';

export const dynamic = 'force-static';
export const revalidate = 600;

async function getAchievements() {
  try {
    const data = await api.payload.getAchievements();
    return data.docs || [];
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }
}

const awardLevelLabels: Record<string, string> = {
  juara_1: '1st Place',
  juara_2: '2nd Place',
  juara_3: '3rd Place',
  honorable_mention: 'Honorable Mention',
  finalist: 'Finalist',
  special_award: 'Special Award',
};

export default async function AchievementsPage() {
  const achievements = await getAchievements();

  return (
    <>
      <HmmExternalNavbar />
      <main className="hmm-sans text-[var(--color-hmm-navy)]">
        <PageClient />

        <section className="hmm-chapter-dark relative min-h-[42svh] scroll-mt-[4.5rem] overflow-hidden">
          <div className="hmm-grad-hero-burst absolute inset-0" aria-hidden />
          <div className="hmm-about-hero-vignette absolute inset-0" aria-hidden />
          <div className="relative z-10 mx-auto flex min-h-[42svh] w-full max-w-[86rem] flex-col justify-end px-4 pt-24 pb-12 sm:px-8 sm:pt-28 sm:pb-14">
            <div className="hmm-eyebrow-rule text-white/85">
              <p className="hmm-type-eyebrow text-[color-mix(in_srgb,var(--color-hmm-yellow)_62%,var(--color-hmm-cream))]">
                Achievements
              </p>
            </div>
            <h1 className="hmm-type-section mt-3 max-w-2xl text-balance text-white">
              Prestasi &amp; Penghargaan
            </h1>
            <p className="hmm-type-lede mt-3 max-w-[46ch] text-white/85">
              Merayakan capaian dan kemenangan kompetisi mahasiswa Teknik Mesin ITB.
            </p>
          </div>
        </section>

        <section className="hmm-chapter-dark border-t border-white/8 px-4 py-[var(--hmm-section-y-md)] sm:px-8">
          <div className="mx-auto max-w-[86rem]">
            {achievements.length === 0 ? (
              <p className="hmm-type-body text-white/70">Belum ada prestasi yang dipublikasikan.</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {achievements.map((achievement) => {
                  const imageUrl =
                    achievement.featuredImage &&
                    typeof achievement.featuredImage === 'object' &&
                    achievement.featuredImage.url
                      ? achievement.featuredImage.url
                      : null;
                  const tags = Array.isArray(achievement.tags) ? achievement.tags : [];
                  const awardLabel =
                    awardLevelLabels[achievement.awardLevel] ||
                    achievement.customAwardLevel ||
                    achievement.awardLevel;

                  return (
                    <Link
                      key={achievement.id}
                      href={`/achievements/${achievement.slug}`}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/15 bg-[color-mix(in_srgb,var(--color-hmm-navy-deep)_55%,var(--color-hmm-navy))] shadow-[0_6px_28px_color-mix(in_srgb,var(--color-hmm-black)_28%,transparent)] transition duration-300 ease-out hover:-translate-y-0.5 hover:border-white/30"
                    >
                      {imageUrl && (
                        <div className="relative aspect-video w-full overflow-hidden">
                          <Image
                            src={imageUrl}
                            alt={achievement.title}
                            fill
                            className="object-cover transition duration-300 group-hover:scale-[1.03]"
                            sizes="(min-width: 1024px) 33vw, 100vw"
                          />
                        </div>
                      )}
                      <div className="flex flex-1 flex-col gap-3 p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="hmm-sans inline-flex w-fit items-center gap-1 rounded-full border border-[var(--color-hmm-yellow)]/50 bg-[color-mix(in_srgb,var(--color-hmm-yellow)_18%,transparent)] px-2.5 py-0.5 text-[0.62rem] font-bold tracking-[0.1em] text-[color-mix(in_srgb,var(--color-hmm-yellow)_78%,var(--color-hmm-cream))] uppercase">
                            <Trophy className="h-3 w-3" />
                            {awardLabel}
                          </span>
                          {achievement.achievementDate && (
                            <span className="hmm-sans inline-flex items-center gap-1.5 text-[0.65rem] font-bold tracking-[0.1em] text-white/55 uppercase">
                              <Calendar className="h-3.5 w-3.5" />
                              {format(new Date(achievement.achievementDate), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                        <h3 className="hmm-type-subsection line-clamp-2 text-white">
                          {achievement.title}
                        </h3>
                        {achievement.competitionName && (
                          <p className="hmm-type-prose line-clamp-1 text-white/75">
                            {achievement.competitionName}
                          </p>
                        )}
                        {tags.length > 0 && (
                          <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                            <Tag className="h-3.5 w-3.5 text-white/50" />
                            {tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="hmm-sans rounded-full border border-white/20 px-2 py-0.5 text-[0.6rem] font-bold tracking-[0.1em] text-white/70 uppercase"
                              >
                                {tag.tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <ExternalLandingFooter />
      </main>
    </>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: 'Achievements',
  };
}
