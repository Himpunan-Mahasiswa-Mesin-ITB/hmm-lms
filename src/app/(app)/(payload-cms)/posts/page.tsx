import { format } from 'date-fns';
import { Calendar, Tag } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next/types';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarGroup,
  AvatarGroupCount,
} from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { api } from '~/trpc/server';

import PageClient from './page.client';

export const dynamic = 'force-static';
export const revalidate = 600;

async function getPosts() {
  try {
    const data = await api.payload.getPosts();

    return data.docs || [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export default async function Page() {
  const posts = await getPosts();

  return (
    <main className="container mx-auto px-4 py-12 max-w-6xl">
      <PageClient />
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Posts</h1>
        <p className="text-muted-foreground text-lg">Explore our latest posts and articles</p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No posts published yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const authors = Array.isArray(post.authors)
              ? post.authors
                  .map((a) => (typeof a === 'object' ? a : null))
                  .filter((a): a is NonNullable<typeof a> => a !== null)
              : [];
            return (
              <Link key={post.id} href={`/posts/${post.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer pt-0">
                  {post.heroImage && typeof post.heroImage === 'object' && post.heroImage.url && (
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                      <img
                        src={post.heroImage.url}
                        alt={post.heroImage.alt || post.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      {post.publishedAt && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-1" />
                          {format(new Date(post.publishedAt), 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                    {post.meta?.description && (
                      <CardDescription className="line-clamp-3">
                        {post.meta.description}
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
                    {post.categories && post.categories.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Tag className="w-4 h-4 text-muted-foreground" />
                        {post.categories.slice(0, 3).map((category, index) => (
                          <Badge key={index} variant="outline" className="text-xs capitalize">
                            {typeof category === 'object' && category.title}
                          </Badge>
                        ))}
                        {post.categories.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{post.categories.length - 3}
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
    </main>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: `Posts`,
  };
}
