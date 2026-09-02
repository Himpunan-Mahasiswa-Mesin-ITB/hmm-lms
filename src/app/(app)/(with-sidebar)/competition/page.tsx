'use client';

import { formatDistanceToNow } from 'date-fns';
import { FileText, ExternalLink } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import { api } from '~/trpc/react';

export default function CompetitionPage() {
  const {
    data: formsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = api.form.getCompetitionForms.useInfiniteQuery(
    { limit: 12 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );

  const forms = formsData?.pages.flatMap((page) => page.forms) ?? [];

  return (
    <div className="container mx-auto max-w-5xl">
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : forms.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No active competitions</h3>
            <p className="text-muted-foreground">
              There are currently no competition forms available.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {forms.map((form) => (
            <Card
              key={form.id}
              className="hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold" title={form.title}>
                    {form.title}
                  </CardTitle>
                  <Badge variant="secondary" className="shrink-0">
                    Competitions
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {form.description ?? 'No description available.'}
                </p>
              </CardHeader>
              <CardContent className="mt-auto pt-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span>
                    Updated {formatDistanceToNow(new Date(form.updatedAt), { addSuffix: true })}
                  </span>
                </div>
                <Button asChild className="w-full">
                  <Link href={`/forms/${form.id}`}>
                    Open Form <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {hasNextPage && (
        <div className="text-center mt-8">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isLoading}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
