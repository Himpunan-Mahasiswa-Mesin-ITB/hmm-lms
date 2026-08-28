import configPromise from '@payload-config';
import { format } from 'date-fns';
import { ArrowLeft, Clock, MapPin, Tag } from 'lucide-react';
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
import { Calendar } from '~/components/ui/calendar';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { generateMeta } from '~/utilities/generateMeta';

import PageClient from './page.client';

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise });
  const events = await payload.find({
    collection: 'events',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  });

  const params = events.docs.map(({ slug }) => {
    return { slug };
  });

  return params;
}

type Args = {
  params: Promise<{
    slug?: string;
  }>;
};

export default async function Event({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode();
  const { slug = '' } = await paramsPromise;
  // Decode to support slugs with special characters
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

  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <Link href="/event">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
      </Link>

      <main>
        {featuredImageUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-lg mb-8">
            <img
              src={featuredImageUrl}
              alt={
                typeof event.featuredImage === 'object' ? event?.featuredImage?.alt : event.title
              }
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <div className="mb-6">
          {event.category && (
            <Badge variant="secondary" className="mb-4 capitalize">
              {event.category}
            </Badge>
          )}
          <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              {event.eventDate && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {format(new Date(event.eventDate), 'MMMM d, yyyy')}
                </div>
              )}
              {event.eventEndDate && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {format(new Date(event.eventEndDate), 'MMMM d, yyyy')}
                </div>
              )}
              {event.location && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {event.location}
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

        {event.tags && event.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-8">
            <Tag className="w-4 h-4 text-muted-foreground" />
            {event.tags.map((tag, index) => (
              <Badge key={index} variant="outline">
                {tag.tag}
              </Badge>
            ))}
          </div>
        )}

        {event.excerpt && (
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">{event.excerpt}</p>
        )}

        <div className="prose dark:prose-invert max-w-none">
          <RichText data={event.content} />
        </div>
      </main>
    </article>
  );
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise;
  // Decode to support slugs with special characters
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
