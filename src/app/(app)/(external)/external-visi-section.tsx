import { RiBriefcase3Line, RiFlaskLine } from '@remixicon/react';
import Image from 'next/image';

import { ExternalReveal } from './external-reveal';

type Props = {
  visi: any;
  visiImage: string | null;
};

export function ExternalVisiSection({ visi, visiImage }: Props) {
  const inkubatorKarya = visi?.inkubatorKarya;

  return (
    <section id="visi" className="hmm-chapter-dark relative scroll-mt-[4.5rem] overflow-hidden">
      <div className="absolute inset-0 bg-[var(--color-hmm-navy-deep)]" aria-hidden />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_0%_20%,color-mix(in_srgb,var(--color-hmm-navy)_35%,transparent),transparent_55%)]"
        aria-hidden
      />

      <div className="hmm-section-y-lg relative z-10 mx-auto max-w-[86rem] px-4 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-14">
          <div>
            <div className="hmm-eyebrow-rule text-[color-mix(in_srgb,var(--color-hmm-cream)_72%,var(--color-hmm-white))]">
              <p className="hmm-type-eyebrow">{visi?.heading || ''}</p>
            </div>

            <h2 className="hmm-type-section mt-3 max-w-[20ch] text-[clamp(2.2rem,5.3vw,4rem)] leading-tight text-balance text-white sm:mt-4">
              {visi?.lead || ''}
            </h2>

            <div className="hmm-tldr mt-6 max-w-3xl">
              <p className="hmm-sans mt-2 text-sm leading-relaxed font-semibold text-white/95 sm:text-base">
                {visi?.tldr || ''}
              </p>
            </div>

            {visiImage ? (
              <div className="relative mt-8 aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/15 shadow-[0_20px_50px_color-mix(in_srgb,var(--color-hmm-black)_35%,transparent)] lg:mt-0 lg:hidden">
                <Image
                  src={visiImage}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
              </div>
            ) : null}

            <ExternalReveal className="mt-8 sm:mt-10">
              <h3 className="hmm-type-subsection text-lg text-white/95 sm:text-xl">
                {inkubatorKarya?.title || ''}
              </h3>

              <div className="mt-8 grid items-stretch gap-6 lg:mt-10 lg:grid-cols-1 lg:gap-6 xl:grid-cols-2 xl:gap-8">
                <div className="hmm-ink-card flex h-full">
                  <div className="flex items-start gap-3">
                    <RiFlaskLine
                      className="mt-0.5 h-7 w-7 shrink-0 text-[color-mix(in_srgb,var(--color-hmm-cream)_88%,var(--color-hmm-maroon))]"
                      aria-hidden
                    />
                    <div>
                      <h4 className="hmm-sans text-xs font-bold tracking-[0.2em] text-[color-mix(in_srgb,var(--color-hmm-cream)_75%,white)] uppercase">
                        {inkubatorKarya?.karya?.subtitle || ''}
                      </h4>
                      <p className="hmm-sans mt-2 text-sm leading-relaxed font-semibold text-white/92">
                        {inkubatorKarya?.karya?.lead || ''}
                      </p>
                      <details className="group/d mt-3">
                        <summary className="hmm-sans cursor-pointer list-none text-xs font-bold tracking-[0.12em] text-white/60 uppercase transition group-open/d:text-white/85">
                          Baca penjabaran
                        </summary>
                        <p className="hmm-type-prose mt-2 border-l-2 border-[color-mix(in_srgb,var(--color-hmm-yellow)_50%,var(--color-hmm-maroon))] pl-3 text-white/78">
                          {inkubatorKarya?.karya?.body || ''}
                        </p>
                      </details>
                    </div>
                  </div>
                </div>
                <div className="hmm-ink-card flex h-full">
                  <div className="flex items-start gap-3">
                    <RiBriefcase3Line
                      className="mt-0.5 h-7 w-7 shrink-0 text-[color-mix(in_srgb,var(--color-hmm-cream)_88%,var(--color-hmm-maroon))]"
                      aria-hidden
                    />
                    <div>
                      <h4 className="hmm-sans text-xs font-bold tracking-[0.2em] text-[color-mix(in_srgb,var(--color-hmm-cream)_75%,white)] uppercase">
                        {inkubatorKarya?.keprofesian?.subtitle || ''}
                      </h4>
                      <p className="hmm-sans mt-2 text-sm leading-relaxed font-semibold text-white/92">
                        {inkubatorKarya?.keprofesian?.lead || ''}
                      </p>
                      <details className="group/d mt-3">
                        <summary className="hmm-sans cursor-pointer list-none text-xs font-bold tracking-[0.12em] text-white/60 uppercase transition group-open/d:text-white/85">
                          Baca penjabaran
                        </summary>
                        <p className="hmm-type-prose mt-2 border-l-2 border-[color-mix(in_srgb,var(--color-hmm-yellow)_50%,var(--color-hmm-maroon))] pl-3 text-white/78">
                          {inkubatorKarya?.keprofesian?.body || ''}
                        </p>
                      </details>
                    </div>
                  </div>
                </div>
              </div>
            </ExternalReveal>
          </div>

          {visiImage ? (
            <div className="relative mt-0 hidden self-start lg:sticky lg:top-28 lg:mt-6 lg:block">
              <div className="relative aspect-[3/4] w-full max-w-md overflow-hidden rounded-2xl border border-white/15 shadow-[0_24px_60px_color-mix(in_srgb,var(--color-hmm-black)_40%,transparent)]">
                <Image
                  src={visiImage}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 38vw, 100vw"
                  priority={false}
                />
                <div className="hmm-vision-photo-badge">Kabinet in motion</div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
