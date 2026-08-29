import { format } from 'date-fns';
import { Calendar, Tag, Trophy } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next/types';

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { api } from '~/trpc/server';

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

export default async function Page() {
  const achievements = await getAchievements();

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <PageClient />
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Achievements</h1>
        <p className="text-muted-foreground text-lg">
          Celebrating our team's accomplishments and competition victories
        </p>
      </div>

      {achievements.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No achievements published yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => {
            const authors = Array.isArray(achievement.authors)
              ? achievement.authors
                .map((a) => (typeof a === 'object' ? a : null))
                .filter((a): a is NonNullable<typeof a> => a !== null)
              : [];

            const awardLabel =
              awardLevelLabels[achievement.awardLevel] ||
              achievement.customAwardLevel ||
              achievement.awardLevel;

            return (
              <Link key={achievement.id} href={`/achievements/${achievement.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer pt-0">
                  {achievement.featuredImage &&
                    typeof achievement.featuredImage === 'object' &&
                    achievement.featuredImage.url && (
                      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                        <img
                          src={achievement.featuredImage.url}
                          alt={achievement.featuredImage.alt || achievement.title}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="secondary"
                        className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                      >
                        <Trophy className="w-3 h-3 mr-1" />
                        {awardLabel}
                      </Badge>
                      {achievement.achievementDate && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-1" />
                          {format(new Date(achievement.achievementDate), 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2">{achievement.title}</CardTitle>
                    {achievement.competitionName && (
                      <CardDescription className="line-clamp-1">
                        {achievement.competitionName}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {authors.length > 0 && (
                      <div className="flex items-center gap-2 mb-4">
                        <AvatarGroup>
                          {authors.slice(0, 3).map((author) => {
                            const authorName = author.name || author.email || 'Unknown';
                            const authorAvatar =
                              typeof author.avatar === 'object' && author.avatar?.url
                                ? author.avatar.url
                                : null;
                            return (
                              <Avatar key={author.id} className="h-8 w-8 border border-background">
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
                            );
                          })}
                          {authors.length - 3 > 0 && (
                            <AvatarGroupCount className="h-8 w-8 border border-background">{`+${authors.length - 3}`}</AvatarGroupCount>
                          )}
                        </AvatarGroup>
                        <span className="text-sm text-muted-foreground">
                          {authors.length === 1
                            ? authors[0]?.name || authors[0]?.email
                            : `${authors.length} authors`}
                        </span>
                      </div>
                    )}
                    {achievement.tags && achievement.tags.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Tag className="w-4 h-4 text-muted-foreground" />
                        {achievement.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs capitalize">
                            {tag.tag}
                          </Badge>
                        ))}
                        {achievement.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{achievement.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: `Achievements`,
  };
}
