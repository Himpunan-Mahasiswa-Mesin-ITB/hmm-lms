import Image from 'next/image';

import { getActiveAbout, getActiveLogoMeanings } from '~/lib/external-content';

export async function ExternalLogoMeaningSection() {
  const about = await getActiveAbout();
  const logoMeanings = await getActiveLogoMeanings();

  function resolveMediaUrl(media: any): string | null {
    if (!media) return null;
    if (typeof media === 'string') return media;
    if (media.url) return media.url;
    if (media.sizes?.url) return media.sizes.url;
    return null;
  }

  return (
    <section id="logo-meaning" className="hmm-about-logo-meaning scroll-mt-[4.5rem] py-14 sm:py-18">
      <div className="mx-auto max-w-[86rem] px-4 sm:px-8">
        <div className="hmm-about-logo-meaning__hero">
          <h2 className="hmm-title text-[clamp(2rem,4.8vw,3.4rem)] leading-[1.03] text-balance text-[color-mix(in_srgb,var(--color-hmm-cream)_95%,white)]">
            Makna di Balik Logo
          </h2>
          <p className="hmm-sans mt-4 max-w-3xl text-[0.98rem] leading-relaxed text-white/78">
            Simbol Kabinet {about?.kabinetName || 'Pionir Berkarya'} dirancang sebagai narasi
            visual: pionir, berkarya, arah yang jelas, dan gerak kolektif.
          </p>
        </div>

        <div className="mt-10 space-y-5 sm:mt-12 sm:space-y-6">
          {logoMeanings.map((item, idx) => {
            const imageUrl = resolveMediaUrl(item.image);
            if (!imageUrl) return null;

            return (
              <article
                key={item.id || idx}
                className={`hmm-about-logo-meaning__row ${idx % 2 === 1 ? 'hmm-about-logo-meaning__row--offset' : ''}`}
              >
                <div className="hmm-about-logo-meaning__step" aria-hidden>
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <div className="hmm-about-logo-meaning__glyph-wrap">
                  <div className="hmm-about-logo-meaning__glyph">
                    <Image
                      src={imageUrl}
                      alt={item.alt || ''}
                      width={170}
                      height={170}
                      className="hmm-about-logo-meaning__glyph-image h-auto w-[clamp(5.25rem,15vw,9.25rem)] object-contain"
                    />
                  </div>
                  <div className="hmm-about-logo-meaning__connector" aria-hidden />
                </div>
                <div className="hmm-about-logo-meaning__copy">
                  <p className="hmm-about-logo-meaning__panel-title">{item.title}</p>
                  <p
                    className="hmm-sans mt-2 text-[0.98rem] leading-relaxed text-white/82"
                    dangerouslySetInnerHTML={{ __html: item.body || '' }}
                  />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
