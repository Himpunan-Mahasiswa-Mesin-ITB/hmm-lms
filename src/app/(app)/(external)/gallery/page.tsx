import { format } from 'date-fns';
import { Calendar, ExternalLink, Tag } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';

import { api } from '~/trpc/server';

import { ExternalLandingFooter } from '../external-landing-footer';
import PageClient from './page.client';

export const dynamic = 'force-static';
export const revalidate = 600;

async function getGallery() {
  try {
    const data = await api.payload.getExternalGallery();
    return data.docs || [];
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return [];
  }
}

export default async function GalleryPage() {
  const gallery = await getGallery();

  return (
    <main className="hmm-sans text-[var(--color-hmm-navy)]">
      <PageClient />

      <section className="hmm-chapter-dark relative min-h-[21svh] sm:min-h-[42svh] scroll-mt-[4.5rem] overflow-hidden">
        <div className="hmm-grad-hero-burst absolute inset-0" aria-hidden />
        <div className="hmm-about-hero-vignette absolute inset-0" aria-hidden />
        <div className="relative z-10 mx-auto flex min-h-[21svh] sm:min-h-[42svh] w-full max-w-[86rem] flex-col justify-end px-4 pt-24 pb-12 sm:px-8 sm:pt-28 sm:pb-14">
          <div className="hmm-eyebrow-rule text-white/85">
            <p className="hmm-type-eyebrow text-[color-mix(in_srgb,var(--color-hmm-yellow)_62%,var(--color-hmm-cream))]">
              Gallery
            </p>
          </div>
          <h1 className="hmm-type-section mt-3 max-w-2xl text-balance text-white">
            Galeri &amp; Album
          </h1>
          <p className="hmm-type-lede mt-3 max-w-[46ch] text-white/85">
            Koleksi foto dan dokumentasi kegiatan HMM ITB.
          </p>
        </div>
      </section>

      <section className="hmm-chapter-dark border-t border-white/8 px-4 py-[var(--hmm-section-y-md)] min-h-screen sm:px-8">
        <div className="mx-auto max-w-[86rem]">
          {gallery.length === 0 ? (
            <p className="text-white/70 text-center">Belum ada galeri yang dipublikasikan.</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((galleryItem) => {
                const imageUrl =
                  galleryItem.albumImage &&
                    typeof galleryItem.albumImage === 'object' &&
                    galleryItem.albumImage.url
                    ? galleryItem.albumImage.url
                    : null;
                const tags = Array.isArray(galleryItem.tags) ? galleryItem.tags : [];

                return (
                  <a
                    key={galleryItem.id}
                    href={galleryItem.googleDriveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex aspect-4/3 w-full overflow-hidden rounded-2xl border border-white/15 bg-[color-mix(in_srgb,var(--color-hmm-navy-deep)_55%,var(--color-hmm-navy))] shadow-[0_6px_28px_color-mix(in_srgb,var(--color-hmm-black)_28%,transparent)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white/30"
                  >
                    {imageUrl && (
                      <Image
                        src={imageUrl}
                        alt={galleryItem.title}
                        fill
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                    )}

                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 group-hover:from-black/95 group-hover:via-black/70" />

                    <div className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white/80 transition-transform duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-black">
                      <ExternalLink className="h-4 w-4" />
                    </div>

                    <div className="relative z-10 mt-auto flex w-full flex-col p-5 text-white">
                      <h3 className="hmm-type-subsection text-lg font-bold text-white transition-colors duration-300 group-hover:text-amber-300">
                        {galleryItem.title}
                      </h3>

                      <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr]">
                        <div className="overflow-hidden">
                          <div className="flex flex-col gap-2.5 pt-3">
                            {galleryItem.publishedAt && (
                              <span className="hmm-sans inline-flex items-center gap-1.5 text-[0.65rem] font-bold tracking-[0.14em] text-white/70 uppercase">
                                <Calendar className="h-3.5 w-3.5 text-white/50" />
                                {format(new Date(galleryItem.publishedAt), 'MMM d, yyyy')}
                              </span>
                            )}

                            {galleryItem.description && (
                              <p className="hmm-type-prose line-clamp-3 text-xs leading-relaxed text-white/80">
                                {galleryItem.description}
                              </p>
                            )}

                            {tags.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <Tag className="h-3 w-3 text-white/50" />
                                {tags.slice(0, 3).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="hmm-sans rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[0.6rem] font-bold tracking-widest text-white/80 uppercase backdrop-blur-sm"
                                  >
                                    {tag.tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <ExternalLandingFooter />
    </main>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: 'Gallery',
  };
}
