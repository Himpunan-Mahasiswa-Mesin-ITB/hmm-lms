import { getPayload } from 'payload';

import config from '../payload.config';

export async function getActiveManifesto() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: 'external-manifesto',
    where: {
      isActive: {
        equals: true,
      },
    },
    limit: 1,
  });
  return result.docs[0] || null;
}

export async function getActiveAbout() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: 'external-about',
    where: {
      isActive: {
        equals: true,
      },
    },
    limit: 1,
  });
  return result.docs[0] || null;
}

export async function getActiveVisi() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: 'external-visi',
    where: {
      isActive: {
        equals: true,
      },
    },
    limit: 1,
  });
  return result.docs[0] || null;
}

export async function getActiveEditorialSpots() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: 'external-editorial-spot',
    where: {
      isActive: {
        equals: true,
      },
    },
    sort: 'id',
  });
  return result.docs;
}

export async function getActiveMisi() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: 'external-misi',
    where: {
      isActive: {
        equals: true,
      },
    },
    sort: 'order',
  });
  return result.docs;
}

export async function getActiveOrganogram() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: 'external-organogram',
    where: {
      isActive: {
        equals: true,
      },
    },
    sort: 'order',
  });

  const sortedDocs = result.docs.sort((a: any, b: any) => {
    if (a.isPrince && !b.isPrince) return -1;
    if (!a.isPrince && b.isPrince) return 1;
    return (a.order || 0) - (b.order || 0);
  });

  return sortedDocs;
}

export async function getActiveHeritageTimeline() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: 'external-heritage-timeline',
    where: {
      isActive: {
        equals: true,
      },
    },
    sort: 'order',
  });
  return result.docs;
}

export async function getActivePillars() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: 'external-pillar',
    where: {
      isActive: {
        equals: true,
      },
    },
    sort: 'order',
  });
  return result.docs;
}

export async function getActiveContact() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: 'external-contact',
    where: {
      isActive: {
        equals: true,
      },
    },
    limit: 1,
  });
  return result.docs[0] || null;
}

export async function getExternalImageByKey(key: string) {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: 'external-image',
    where: {
      and: [
        {
          key: {
            equals: key,
          },
        },
        {
          isActive: {
            equals: true,
          },
        },
      ],
    },
    limit: 1,
  });
  return result.docs[0] || null;
}

export async function getAllExternalImages() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: 'external-image',
    where: {
      isActive: {
        equals: true,
      },
    },
  });
  return result.docs;
}

export async function getActiveLogoMeanings() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: 'external-logo-meaning',
    where: {
      isActive: {
        equals: true,
      },
    },
    sort: 'order',
  });
  return result.docs;
}
