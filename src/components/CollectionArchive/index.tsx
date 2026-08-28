import React from 'react';

import { Card, type CardData } from '~/components/Card';
import { cn } from '~/utilities/ui';

export type Props = {
  posts: CardData[];
  relationTo?: 'posts' | 'event' | 'achievements' | 'news';
};

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts, relationTo = 'posts' } = props;

  return (
    <div className={cn('container')}>
      <div>
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
          {posts?.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <div className="col-span-4" key={index}>
                  <Card className="h-full" doc={result} relationTo={relationTo} showCategories />
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    </div>
  );
};
