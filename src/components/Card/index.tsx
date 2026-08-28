'use client';
import Link from 'next/link';
import React from 'react';

import { Media as MediaComponent } from '~/components/Media';
import type { Post, Event, Achievement, News } from '~/payload-types';
import { cn } from '~/utilities/ui';
import useClickableCard from '~/utilities/useClickableCard';

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title'>;
export type CardEventData = Pick<
  Event,
  'slug' | 'category' | 'meta' | 'title' | 'excerpt' | 'featuredImage'
>;
export type CardAchievementData = Pick<
  Achievement,
  'slug' | 'awardLevel' | 'meta' | 'title' | 'featuredImage'
>;
export type CardNewsData = Pick<News, 'slug' | 'meta' | 'title' | 'summary' | 'featuredImage'>;

export type CardData = CardPostData | CardEventData | CardAchievementData | CardNewsData;

export const Card: React.FC<{
  alignItems?: 'center';
  className?: string;
  doc?: CardData;
  relationTo?: 'posts' | 'event' | 'achievements' | 'news';
  showCategories?: boolean;
  title?: string;
}> = (props) => {
  const { card, link } = useClickableCard({});
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props;

  const { slug, meta, title } = doc || {};
  const { description, image: metaImage } = meta || {};

  const isEvent = relationTo === 'event';
  const isAchievement = relationTo === 'achievements';
  const isNews = relationTo === 'news';
  const isPost = relationTo === 'posts';

  let featuredImage = metaImage;
  if (doc && (isEvent || isAchievement || isNews) && 'featuredImage' in doc) {
    featuredImage = (doc as CardEventData | CardAchievementData | CardNewsData).featuredImage;
  }

  // get category/label based on collection type
  let categoryLabel = '';
  if (doc && isEvent && 'category' in doc) {
    categoryLabel = (doc as CardEventData).category;
  } else if (doc && isAchievement && 'awardLevel' in doc) {
    categoryLabel = (doc as CardAchievementData).awardLevel;
  } else if (doc && isPost && 'categories' in doc) {
    const categories = (doc as CardPostData).categories;
    if (categories && Array.isArray(categories) && categories.length > 0) {
      categoryLabel = categories
        .map((cat) => (typeof cat === 'object' ? cat.title : cat))
        .join(', ');
    }
  }

  // get description/summary based on collection type
  let displayDescription = description;
  if (doc && isEvent && 'excerpt' in doc) {
    displayDescription = (doc as CardEventData).excerpt;
  } else if (doc && isNews && 'summary' in doc) {
    displayDescription = (doc as CardNewsData).summary;
  }

  const titleToUse = titleFromProps || title;
  const sanitizedDescription = displayDescription?.replace(/\s/g, ' '); // replace non-breaking space with white space
  const href = `/${relationTo}/${slug}`;

  return (
    <article
      className={cn(
        'border border-border rounded-lg overflow-hidden bg-card hover:cursor-pointer',
        className,
      )}
      ref={card.ref}
    >
      <div className="relative w-full ">
        {!featuredImage && <div className="">No image</div>}
        {featuredImage &&
          typeof featuredImage !== 'string' &&
          typeof featuredImage !== 'number' && (
            <MediaComponent resource={featuredImage} size="33vw" />
          )}
      </div>
      <div className="p-4">
        {showCategories && categoryLabel && (
          <div className="uppercase text-sm mb-4">{categoryLabel}</div>
        )}
        {titleToUse && (
          <div className="prose">
            <h3>
              <Link className="not-prose text-white!" href={href} ref={link.ref}>
                {titleToUse}
              </Link>
            </h3>
          </div>
        )}
        {sanitizedDescription && (
          <div className="mt-2">
            <p>{sanitizedDescription}</p>
          </div>
        )}
      </div>
    </article>
  );
};
