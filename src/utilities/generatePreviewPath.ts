import type { PayloadRequest, CollectionSlug } from 'payload';

import type { PreviewSearchParams } from '~/app/(app)/(payload-cms)/next/preview/route';

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  posts: '/posts',
  pages: '',
};

type Props = {
  collection: keyof typeof collectionPrefixMap;
  slug: string;
  req: PayloadRequest;
};

export const generatePreviewPath = ({ collection, slug }: Props) => {
  if (slug === undefined || slug === null) {
    return null;
  }

  // Encode to support slugs with special characters
  const encodedSlug = encodeURIComponent(slug);

  const encodedParams = new URLSearchParams({
    path: `${collectionPrefixMap[collection]}/${encodedSlug}`,
    previewSecret: process.env.PREVIEW_SECRET || '',
  } satisfies PreviewSearchParams);

  const url = `/next/preview?${encodedParams.toString()}`;

  return url;
};
