import Image from 'next/image';

import {
  getActiveManifesto,
  getActiveEditorialSpots,
  getActiveHeritageTimeline,
  getActivePillars,
  getExternalImageByKey,
} from '~/lib/external-content';

import { ExternalEditorialGrid } from './external-editorial-grid';
import { ExternalLandingFooter } from './external-landing-footer';
import { ExternalReveal } from './external-reveal';
import { ExternalSolidarityCta } from './external-solidarity-cta';
import { ExternalWordmarkRail } from './external-wordmark-rail';
import { HmmExternalNavbar } from './hmm-external-navbar';

function resolveMediaUrl(media: any): string | null {
  if (!media) return null;
  if (typeof media === 'string') return media;
  if (media.url) return media.url;
  if (media.sizes?.url) return media.sizes.url;
  return null;
}

export default async function ExternalLandingPage() {
  const manifesto = await getActiveManifesto();
  const editorialSpots = await getActiveEditorialSpots();
  const heritageTimeline = await getActiveHeritageTimeline();
  const pillars = await getActivePillars();

  const heroImage = await getExternalImageByKey('hero');
  const pillarStudyImage = await getExternalImageByKey('pillarStudy');
  const pillarSocietyImage = await getExternalImageByKey('pillarSociety');
  const pillarSolidarityImage = await getExternalImageByKey('pillarSolidarity');
  const heritageImage = await getExternalImageByKey('heritage');
  const ctaImage = await getExternalImageByKey('cta');

  const im = {
    hero: resolveMediaUrl(heroImage?.image),
    pillarStudy: resolveMediaUrl(pillarStudyImage?.image),
    pillarSociety: resolveMediaUrl(pillarSocietyImage?.image),
    pillarSolidarity: resolveMediaUrl(pillarSolidarityImage?.image),
    heritage: resolveMediaUrl(heritageImage?.image),
    cta: resolveMediaUrl(ctaImage?.image),
  };

  const editorialResolved = editorialSpots.map((s: any) => ({
    ...s,
    imageUrl: resolveMediaUrl(s.image),
  }));

  return (
    <>
      <HmmExternalNavbar />
      <main className="hmm-sans text-[var(--color-hmm-navy)]">
        {/* — Manifesto — */}
        <section
          id="manifesto"
          className="hmm-chapter-dark relative min-h-[100svh] scroll-mt-[4.5rem] overflow-hidden"
        >
          {im.hero ? (
            <Image src={im.hero} alt="" fill priority className="object-cover" sizes="100vw" />
          ) : (
            <div className="hmm-grad-hero-burst absolute inset-0" aria-hidden />
          )}
          {im.hero ? (
            <>
              <div className="hmm-grad-hero absolute inset-0" />
              <div className="hmm-grad-vignette absolute inset-0 opacity-40 mix-blend-multiply" />
            </>
          ) : (
            <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--color-hmm-navy-deep)_50%,transparent)]" />
          )}

          <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[86rem] flex-col justify-end px-4 pt-20 pb-[max(3rem,env(safe-area-inset-bottom,0px))] min-[400px]:px-5 sm:px-8 sm:pt-24 sm:pb-20">
            <div className="mb-6 flex min-w-0 flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:gap-5">
              <div className="flex shrink-0 items-center gap-3 min-[400px]:gap-4 sm:gap-5">
                <Image
                  src="/external/images/logos/logo-hmm.png"
                  alt="HMM ITB"
                  width={80}
                  height={80}
                  priority
                  className="h-14 w-14 object-contain drop-shadow-lg min-[400px]:h-16 min-[400px]:w-16 sm:h-[4.5rem] sm:w-[4.5rem]"
                />
                <Image
                  src="/external/images/logos/logo-putih.svg"
                  alt=""
                  width={72}
                  height={72}
                  className="h-12 w-12 object-contain opacity-95 drop-shadow-md min-[400px]:h-14 min-[400px]:w-14 sm:h-16 sm:w-16"
                  priority
                />
              </div>
              <div className="hmm-eyebrow-rule min-w-0 text-white/90 sm:min-w-0 sm:flex-1">
                {/* <p className="hmm-sans text-[clamp(0.7rem,2.1vw,0.875rem)] leading-snug font-semibold tracking-[0.1em] sm:text-sm sm:tracking-[0.16em]">
                  HIMPUNAN MAHASISWA MESIN ITB
                </p> */}
              </div>
            </div>

            <h1 className="hmm-pair-6-5 max-w-full text-balance text-white sm:max-w-[90%]">
              <span className="hmm-pair-title block">HMM ITB</span>
              <span className="hmm-pair-sub mt-1 block text-white/90">
                HIMPUNAN MAHASISWA MESIN ITB
              </span>
            </h1>

            <p className="hmm-type-punch mt-6 text-balance text-white drop-shadow-sm sm:mt-8">
              {manifesto?.punch || ''}
            </p>
            <p className="hmm-type-lede mt-4 max-w-full text-pretty text-white/90 sm:max-w-[50ch]">
              {manifesto?.support || ''}
            </p>

            <div className="mt-8 flex max-w-2xl flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-3">
              <a
                href="#editorial"
                className="hmm-btn-cta hmm-btn-cta--primary min-h-11 w-full sm:min-h-0 sm:w-auto sm:min-w-[12rem]"
              >
                Sorotan visual
              </a>
              <div className="flex min-h-11 w-full items-stretch gap-3 sm:min-h-0 sm:w-auto sm:min-w-[12rem]">
                <div
                  className="hmm-tiga-pilar-stripes hmm-tiga-pilar-stripes--sm shrink-0"
                  role="img"
                  aria-label="Tiga pilar: Study, Society, Solidarity (tiga garis putih)"
                >
                  <span className="hmm-tiga-pilar-stripes__bar" />
                  <span className="hmm-tiga-pilar-stripes__bar" />
                  <span className="hmm-tiga-pilar-stripes__bar" />
                </div>
                <a
                  href="#pillars"
                  className="hmm-btn-cta hmm-btn-cta--secondary flex min-h-11 flex-1 items-center justify-center sm:min-h-0"
                >
                  Tiga pilar
                </a>
              </div>
            </div>

            <div className="mt-8 flex w-full max-w-md flex-col gap-4 self-stretch sm:mt-9 sm:max-w-none sm:self-auto">
              <div className="flex gap-1.5" aria-hidden>
                <span className="h-1 w-20 bg-[var(--color-hmm-yellow)]" />
                <span className="h-1 w-16 bg-[var(--color-hmm-maroon)]" />
              </div>
              <div className="pointer-events-none text-left sm:ml-0 sm:text-right">
                <p className="hmm-sans text-[0.6rem] font-bold tracking-[0.2em] text-white/55">
                  KABINET
                </p>
                <p className="hmm-sans text-[0.7rem] font-bold tracking-[0.18em] text-[color-mix(in_srgb,var(--color-hmm-yellow)_50%,var(--color-hmm-cream))]">
                  {manifesto?.kabinetName || 'PIONIR BERKARYA'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <ExternalWordmarkRail />

        <ExternalEditorialGrid spots={editorialResolved} />

        <div className="hmm-chapter-transition-editorial" aria-hidden />

        {/* — Three pillars (distinct layouts) — */}
        <div id="pillars" className="scroll-mt-[4.5rem]">
          <div className="hmm-chapter-dark border-b border-white/8 bg-[color-mix(in_srgb,var(--color-hmm-navy-deep)_96%,var(--color-hmm-navy))] px-4 py-5 sm:px-8 sm:py-8">
            <div className="mx-auto flex max-w-[86rem] flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="hmm-tiga-pilar-stripes hmm-tiga-pilar-stripes--lg" aria-hidden>
                  <span className="hmm-tiga-pilar-stripes__bar" />
                  <span className="hmm-tiga-pilar-stripes__bar" />
                  <span className="hmm-tiga-pilar-stripes__bar" />
                </div>
                <p className="hmm-sans text-[0.6rem] font-bold tracking-[0.16em] text-white/50 uppercase sm:text-[0.65rem] sm:tracking-[0.18em]">
                  Tiga pilar
                </p>
              </div>
              <p className="hmm-sans text-[0.875rem] leading-relaxed font-medium text-white/70 sm:max-w-[42ch] sm:text-sm">
                Study, Society, Solidarity
              </p>
            </div>
          </div>
          {/* Study — split */}
          <section className="hmm-chapter-dark relative min-h-0 overflow-hidden lg:min-h-[85svh]">
            <div className="grid min-h-0 lg:min-h-[85svh] lg:grid-cols-2">
              <div className="relative min-h-[40svh] sm:min-h-[48svh] lg:min-h-full">
                {im.pillarStudy ? (
                  <Image
                    src={im.pillarStudy}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[var(--color-hmm-navy)]" />
                )}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-[color-mix(in_srgb,var(--color-hmm-navy-deep)_10%,transparent)] to-[color-mix(in_srgb,var(--color-hmm-navy-deep)_58%,transparent)] lg:from-[color-mix(in_srgb,var(--color-hmm-navy-deep)_8%,transparent)] lg:to-[color-mix(in_srgb,var(--color-hmm-navy-deep)_72%,transparent)]"
                  aria-hidden
                />
              </div>
              <div className="hmm-section-y-md flex flex-col justify-end px-4 sm:px-8 lg:px-12">
                <div className="hmm-eyebrow-rule text-white/80">
                  <p className="hmm-type-eyebrow text-[var(--color-hmm-cream)]">01</p>
                </div>
                <h2 className="hmm-type-section mt-3 text-balance text-white sm:mt-4">Study</h2>
                <p className="hmm-sans text-xs font-bold tracking-[0.2em] text-white/50 uppercase">
                  {pillars[0]?.kicker || ''}
                </p>
                <p className="hmm-type-prose mt-5 text-white/85">{pillars[0]?.description || ''}</p>
              </div>
            </div>
          </section>

          {/* Society — full bleed, left-weighted */}
          <section className="relative min-h-[min(88svh,40rem)] overflow-hidden sm:min-h-[80svh]">
            {im.pillarSociety ? (
              <Image
                src={im.pillarSociety}
                alt=""
                fill
                className="object-cover"
                style={{ objectPosition: '18% 42%' }}
                sizes="100vw"
              />
            ) : (
              <div className="absolute inset-0 bg-[var(--color-hmm-navy)]" />
            )}
            <div className="hmm-grad-society absolute inset-0" aria-hidden />
            <div className="absolute inset-0 bg-gradient-to-t from-[color-mix(in_srgb,var(--color-hmm-navy-deep)_40%,transparent)] to-transparent" />

            <div className="hmm-section-y-md relative z-10 flex min-h-[min(88svh,40rem)] w-full max-w-[86rem] flex-col justify-end px-4 sm:min-h-[80svh] sm:px-8">
              <div className="hmm-eyebrow-rule text-white/85">
                <p className="hmm-type-eyebrow text-[var(--color-hmm-cream)]">02</p>
              </div>
              <blockquote className="hmm-title mt-3 max-w-full text-[clamp(1.5rem,6vw,3rem)] leading-[1.2] font-bold text-balance text-white sm:max-w-[20ch] sm:text-4xl md:max-w-[24ch] md:text-5xl">
                Society
              </blockquote>
              <h2 className="hmm-sans mt-4 text-sm font-bold tracking-[0.2em] text-white/60 uppercase">
                {pillars[1]?.kicker || ''}
              </h2>
              <p className="hmm-type-prose mt-4 max-w-[50ch] text-white/90">
                {pillars[1]?.description || ''}
              </p>
            </div>
          </section>

          {/* Solidarity — text column + full image column */}
          <section className="hmm-chapter-dark relative min-h-0 overflow-hidden">
            <div className="grid min-h-0 items-stretch lg:min-h-[min(75svh,48rem)] lg:grid-cols-[minmax(0,42%)_1fr]">
              <div className="hmm-section-y-md order-2 flex flex-col justify-center bg-[var(--color-hmm-navy-deep)] px-4 sm:px-8 lg:order-1 lg:pr-4 lg:pl-8 xl:pl-12">
                <div className="hmm-eyebrow-rule text-white/85">
                  <p className="hmm-type-eyebrow text-[var(--color-hmm-cream)]">03</p>
                </div>
                <h2 className="hmm-type-section mt-3 text-balance text-white sm:mt-2">
                  {pillars[2]?.title || ''}
                </h2>
                <p className="hmm-sans text-xs font-bold tracking-[0.2em] text-white/50 uppercase">
                  {pillars[2]?.kicker || ''}
                </p>
                <p className="hmm-type-prose mt-4 text-pretty text-white/85">
                  {pillars[2]?.description || ''}
                </p>
              </div>
              <div className="relative order-1 min-h-[44svh] sm:min-h-[52svh] lg:order-2 lg:min-h-full">
                {im.pillarSolidarity ? (
                  <Image
                    src={im.pillarSolidarity}
                    alt=""
                    fill
                    className="object-cover"
                    style={{ objectPosition: '50% 35%' }}
                    sizes="(min-width: 1024px) 58vw, 100vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[var(--color-hmm-navy)]" />
                )}
                <div className="hmm-grad-solidarity absolute inset-0" aria-hidden />
                <div className="absolute inset-0 bg-gradient-to-r from-[color-mix(in_srgb,var(--color-hmm-navy-deep)_70%,transparent)] to-transparent" />
              </div>
            </div>
          </section>
        </div>

        <div className="hmm-chapter-transition" aria-hidden />

        {/* — Heritage: same dark canvas as the rest (no beige “island”) — */}
        <section
          id="heritage"
          className="hmm-chapter-dark relative scroll-mt-[4.5rem] overflow-hidden"
        >
          {im.heritage ? (
            <div className="relative h-[min(42svh,26rem)] w-full border-b border-white/8">
              <Image
                src={im.heritage}
                alt=""
                fill
                className="object-cover"
                style={{ objectPosition: '50% 40%' }}
                sizes="100vw"
              />
              <div
                className="absolute inset-0 bg-gradient-to-b from-transparent via-[color-mix(in_srgb,var(--color-hmm-navy-deep)_35%,transparent)] to-[var(--color-hmm-navy-deep)]"
                aria-hidden
              />
            </div>
          ) : null}

          <div className="hmm-section-y-md mx-auto max-w-[86rem] px-4 sm:px-8">
            <div className="hmm-eyebrow-rule hmm-eyebrow-rule--cool text-white/55">
              <p className="hmm-type-eyebrow text-[color-mix(in_srgb,var(--color-hmm-cream)_85%,white)]">
                Heritage
              </p>
            </div>
            <h2 className="hmm-type-section mt-2 text-white">Est. 1946</h2>
            <p className="hmm-heritage-body hmm-type-prose mt-3 max-w-[60ch] leading-relaxed">
              Dari 1946 — terus bergerak, berdampak.
            </p>

            <ExternalReveal>
              <div className="mt-12 flex flex-col gap-12 md:mt-16 md:flex-row md:items-start md:gap-20">
                <div className="shrink-0">
                  <p className="hmm-heritage-stat-num hmm-title text-6xl leading-none font-bold sm:text-7xl">
                    80+
                  </p>
                  <p className="hmm-sans mt-2 text-sm font-semibold tracking-[0.16em] text-white/70">
                    YEARS IN MOTION
                  </p>
                </div>
                <ol className="hmm-timeline hmm-timeline--on-dark">
                  {heritageTimeline.map((item) => (
                    <li key={item.id} className="pb-10 last:pb-0">
                      <p className="hmm-heritage-year hmm-title text-3xl font-bold sm:text-4xl">
                        {item.year}
                      </p>
                      <h3 className="hmm-sans mt-2 text-base font-bold tracking-[0.12em] text-white uppercase">
                        {item.title}
                      </h3>
                      <p className="hmm-heritage-body hmm-type-prose mt-3 max-w-prose leading-relaxed">
                        {item.text}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </ExternalReveal>
          </div>
        </section>

        {/* — CTA / Solidarity — */}
        <section
          id="solidarity"
          className="relative min-h-[min(64svh,40rem)] scroll-mt-[4.5rem] overflow-hidden"
        >
          {im.cta ? (
            <Image
              src={im.cta}
              alt=""
              fill
              className="object-cover"
              style={{ objectPosition: '50% 45%' }}
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-[var(--color-hmm-navy-deep)]" />
          )}
          <div className="hmm-grad-cta absolute inset-0" aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-t from-[color-mix(in_srgb,var(--color-hmm-navy-deep)_38%,transparent)] to-transparent" />

          <div className="hmm-section-y-lg relative z-10 mx-auto flex min-h-[min(64svh,40rem)] w-full max-w-[86rem] flex-col justify-end px-4 sm:px-8">
            <div className="hmm-eyebrow-rule text-white/85">
              <p className="hmm-type-eyebrow text-[color-mix(in_srgb,var(--color-hmm-yellow)_55%,var(--color-hmm-cream))]">
                Solidarity
              </p>
            </div>
            <h2 className="hmm-type-section mt-2 max-w-3xl text-white">Solidarity forever</h2>
            <p className="hmm-type-prose mt-4 max-w-2xl text-white/90">
              Satu arah, satu solidaritas, memperkuat pionir masa depan dalam dan luar kampus.
            </p>
            <ExternalSolidarityCta />
          </div>
        </section>

        <ExternalLandingFooter />
      </main>
    </>
  );
}
