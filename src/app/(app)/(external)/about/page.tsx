import Image from 'next/image';

import {
  getActiveAbout,
  getActiveVisi,
  getActiveOrganogram,
  getActiveMisi,
} from '~/lib/external-content';

import { ExternalLogoMeaningSection } from '../external-logo-meaning-section';
import { ExternalMisiSection } from '../external-misi-section';
import { ExternalOrganogramSection } from '../external-organogram-section';
import { ExternalVisiSection } from '../external-visi-section';
import { HmmExternalNavbar } from '../hmm-external-navbar';

function resolveMediaUrl(media: any): string | null {
  if (!media) return null;
  if (typeof media === 'string') return media;
  if (media.url) return media.url;
  if (media.sizes?.url) return media.sizes.url;
  return null;
}

export default async function ExternalAboutPage() {
  const about = await getActiveAbout();
  const visi = await getActiveVisi();
  const organogram = await getActiveOrganogram();
  const misi = await getActiveMisi();

  const heroImage = resolveMediaUrl(about?.heroImage);
  const visiImage = resolveMediaUrl(visi?.heroImage);

  const organogramResolved = organogram
    .map((item) => ({
      title: item.title,
      imageSrc: resolveMediaUrl(item.image),
      imageUrl: resolveMediaUrl(item.image),
      detailType: item.detailType,
      featuredDetail: item.featuredDetail,
      rosterDetail: item.rosterDetail,
      isPrince: item.isPrince === true,
    }))
    .filter((item): item is typeof item & { imageUrl: string } => item.imageUrl !== null);

  return (
    <>
      <HmmExternalNavbar />
      <main className="hmm-sans text-[var(--color-hmm-navy)]">
        <section
          id="about-hero"
          className="hmm-chapter-dark relative min-h-[82svh] scroll-mt-[4.5rem] overflow-hidden"
        >
          {heroImage ? (
            <Image src={heroImage} alt="" fill priority className="object-cover" sizes="100vw" />
          ) : (
            <div className="hmm-grad-hero-burst absolute inset-0" aria-hidden />
          )}
          <div className="hmm-about-hero-overlay absolute inset-0" aria-hidden />
          <div className="hmm-about-hero-vignette absolute inset-0" aria-hidden />

          <div className="relative z-10 mx-auto flex min-h-[82svh] w-full max-w-[86rem] flex-col justify-end px-4 pt-24 pb-14 sm:px-8 sm:pt-28 sm:pb-18">
            <div className="hmm-eyebrow-rule text-white/85">
              <p className="hmm-type-eyebrow text-[color-mix(in_srgb,var(--color-hmm-yellow)_62%,var(--color-hmm-cream))]">
                Kabinet {about?.kabinetName || 'Pionir Berkarya'}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
              <Image
                src="/external/images/logos/logo-putih.svg"
                alt={`Logo Kabinet ${about?.kabinetName || 'Pionir Berkarya'}`}
                width={92}
                height={92}
                className="h-18 w-18 object-contain drop-shadow-lg sm:h-22 sm:w-22"
                priority
              />
              <div className="max-w-3xl">
                <h1 className="hmm-type-section text-balance text-white">
                  <span className="font-semibold italic">{about?.headingPrefix || ''}</span>{' '}
                  {about?.headingSuffix || ''}
                </h1>
                <p className="hmm-type-lede mt-3 max-w-[44ch] text-white/90">{about?.lead || ''}</p>
              </div>
            </div>
          </div>
        </section>

        <ExternalLogoMeaningSection />
        <ExternalOrganogramSection items={organogramResolved} />
        <section className="hmm-about-vision-bridge" aria-hidden />
        <section className="hmm-about-vision-intro hmm-chapter-dark">
          <div className="mx-auto max-w-[86rem] px-4 py-6 sm:px-8 sm:py-7">
            <p className="hmm-type-eyebrow text-white/70">Vision and Mission</p>
            <h2 className="hmm-type-section mt-2 text-white">
              Arah gerak Kabinet {about?.kabinetName || 'Pionir Berkarya'}
            </h2>
            <p className="hmm-type-prose mt-3 max-w-3xl text-white/82">
              Visi sebagai kompas utama, lalu diterjemahkan menjadi misi kerja yang bertahap dan
              terukur.
            </p>
          </div>
        </section>
        <ExternalVisiSection visi={visi} visiImage={visiImage} />
        <ExternalMisiSection misi={misi} />
      </main>
    </>
  );
}
