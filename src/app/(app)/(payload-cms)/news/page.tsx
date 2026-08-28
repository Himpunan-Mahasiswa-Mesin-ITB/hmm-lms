import { format } from 'date-fns';
import { Calendar, Tag } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

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

async function getNews() {
  try {
    const data = await api.payload.getNews();

    return data.docs || [];
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

export default async function NewsPage() {
  const news = await getNews();

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">News</h1>
        <p className="text-muted-foreground text-lg">
          Stay updated with the latest announcements and updates
        </p>
      </div>

      {news.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No news published yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.map((newsItem) => {
            const authors = Array.isArray(newsItem.authors)
              ? newsItem.authors
                  .map((a) => (typeof a === 'object' ? a : null))
                  .filter((a): a is NonNullable<typeof a> => a !== null)
              : [];

            return (
              <Link key={newsItem.id} href={`/news/${newsItem.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer pt-0">
                  {newsItem.featuredImage &&
                    typeof newsItem.featuredImage === 'object' &&
                    newsItem.featuredImage.url && (
                      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                        <img
                          src={newsItem.featuredImage.url}
                          alt={newsItem.featuredImage.alt || newsItem.title}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                  <CardHeader>
                    {newsItem.publishedAt && (
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <Calendar className="w-4 h-4 mr-1" />
                        {format(new Date(newsItem.publishedAt), 'MMM d, yyyy')}
                      </div>
                    )}
                    <CardTitle className="line-clamp-2">{newsItem.title}</CardTitle>
                    {newsItem.summary && (
                      <CardDescription className="line-clamp-3">{newsItem.summary}</CardDescription>
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
                    {newsItem.tags && newsItem.tags.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Tag className="w-4 h-4 text-muted-foreground" />
                        {newsItem.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs capitalize">
                            {tag.tag}
                          </Badge>
                        ))}
                        {newsItem.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{newsItem.tags.length - 3}
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
    title: `News`,
  };
}
