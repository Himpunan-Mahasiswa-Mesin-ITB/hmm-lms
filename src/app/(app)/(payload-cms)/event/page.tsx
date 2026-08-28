import { format } from 'date-fns';
import { Calendar, MapPin, Tag, Clock } from 'lucide-react';
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

async function getEvents() {
  try {
    const data = await api.payload.getEvents();

    return data.docs || [];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

export default async function Page() {
  const events = await getEvents();

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <PageClient />
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Events</h1>
        <p className="text-muted-foreground text-lg">
          Discover upcoming events, workshops, and activities
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No events published yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const authors = Array.isArray(event.authors)
              ? event.authors
                  .map((a) => (typeof a === 'object' ? a : null))
                  .filter((a): a is NonNullable<typeof a> => a !== null)
              : [];

            return (
              <Link key={event.id} href={`/events/${event.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer pt-0">
                  {event.featuredImage &&
                    typeof event.featuredImage === 'object' &&
                    event.featuredImage.url && (
                      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                        <img
                          src={event.featuredImage.url}
                          alt={event.featuredImage.alt || event.title}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                  <CardHeader>
                    {event.category && (
                      <Badge variant="secondary" className="w-fit mb-2">
                        {event.category}
                      </Badge>
                    )}
                    <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                    {event.excerpt && (
                      <CardDescription className="line-clamp-3">{event.excerpt}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {event.eventDate && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2" />
                          {format(new Date(event.eventDate), 'MMM d, yyyy')}
                        </div>
                      )}
                      {event.eventEndDate && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 mr-2" />
                          {format(new Date(event.eventEndDate), 'MMM d, yyyy')}
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2" />
                          {event.location}
                        </div>
                      )}
                    </div>
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
                    {event.tags && event.tags.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Tag className="w-4 h-4 text-muted-foreground" />
                        {event.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs capitalize">
                            {tag.tag}
                          </Badge>
                        ))}
                        {event.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{event.tags.length - 3}
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
    title: `Events`,
  };
}
