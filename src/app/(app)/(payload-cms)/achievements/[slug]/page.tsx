import configPromise from '@payload-config';
import { format } from 'date-fns';
import { Calendar, ArrowLeft, Tag, Trophy, Users } from 'lucide-react';
import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import Link from 'next/link';
import { getPayload } from 'payload';
import { cache } from 'react';

import { LivePreviewListener } from '~/components/LivePreviewListener';
import { PayloadRedirects } from '~/components/PayloadRedirects';
import RichText from '~/components/RichText';
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { generateMeta } from '~/utilities/generateMeta';

import PageClient from './page.client';

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise });
  const achievements = await payload.find({
    collection: 'achievements',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  });

  const params = achievements.docs.map(({ slug }) => {
    return { slug };
  });

  return params;
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
  // Decode to support slugs with special characters
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

  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <Link href="/achievements">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Achievements
        </Button>
      </Link>

      <article>
        {featuredImageUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-lg mb-8">
            <img
              src={featuredImageUrl}
              alt={
                typeof achievement.featuredImage === 'object'
                  ? achievement?.featuredImage?.alt
                  : achievement.title
              }
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <div className="mb-6">
          <Badge
            variant="secondary"
            className="mb-4 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
          >
            <Trophy className="w-3 h-3 mr-1" />
            {awardLabel}
          </Badge>
          <h1 className="text-4xl font-bold mb-4">{achievement.title}</h1>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center gap-4 text-muted-foreground">
              {achievement.achievementDate && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {format(new Date(achievement.achievementDate), 'MMMM d, yyyy')}
                </div>
              )}
              {achievement.competitionName && (
                <div className="flex items-center">
                  <Trophy className="w-4 h-4 mr-2" />
                  {achievement.competitionName}
                </div>
              )}
            </div>
            {authors.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3 w-fit">
                    <AvatarGroup>
                      {authors.slice(0, 3).map((author) => {
                        const authorName = author.name || author.email || 'Unknown';
                        const authorAvatar =
                          typeof author.avatar === 'object' && author.avatar?.url
                            ? author.avatar.url
                            : null;
                        return (
                          <Avatar key={author.id} className="h-10 w-10 border border-background">
                            {authorAvatar ? (
                              <AvatarImage
                                className="object-cover!"
                                src={authorAvatar}
                                alt={authorName}
                              />
                            ) : null}
                            <AvatarFallback>
                              {authorName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        );
                      })}
                      {authors.length - 3 > 0 && (
                        <AvatarGroupCount className="h-10 w-10 border border-background">
                          {`+${authors.length - 3}`}
                        </AvatarGroupCount>
                      )}
                    </AvatarGroup>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {authors.length === 1
                          ? authors[0]?.name || authors[0]?.email
                          : `${authors.length} authors`}
                      </span>
                      {authors.length === 1 && authors[0]?.bio && (
                        <span className="text-sm text-muted-foreground">{authors[0]?.bio}</span>
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="flex flex-col gap-2 p-3">
                  {authors.map((author) => {
                    const authorName = author.name || author.email || 'Unknown';
                    const authorAvatar =
                      typeof author.avatar === 'object' && author.avatar?.url
                        ? author.avatar.url
                        : null;
                    return (
                      <div key={author.id} className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7">
                          {authorAvatar ? (
                            <AvatarImage
                              className="object-cover!"
                              src={authorAvatar}
                              alt={authorName}
                            />
                          ) : null}
                          <AvatarFallback className="text-xs">
                            {authorName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col leading-tight">
                          <span className="font-medium text-xs">{authorName}</span>
                        </div>
                      </div>
                    );
                  })}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {achievement.tags && achievement.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-8">
            <Tag className="w-4 h-4 text-muted-foreground" />
            {achievement.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="capitalize">
                {tag.tag}
              </Badge>
            ))}
          </div>
        )}

        {achievement.teamMembers && achievement.teamMembers.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Team Members
            </h3>
            <div className="grid gap-2 md:grid-cols-2">
              {achievement.teamMembers.map((member, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{member.memberName}</p>
                    {member.nim && (
                      <p className="text-sm text-muted-foreground">NIM: {member.nim}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="prose dark:prose-invert max-w-none">
          <RichText data={achievement.content} />
        </div>
      </article>
    </article>
  );
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise;
  // Decode to support slugs with special characters
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
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  });

  return result.docs?.[0] || null;
});
