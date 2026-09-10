"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

export type ResolvedEditorialSpot = {
  id: string;
  image: any;
  imageUrl: string | null;
  tag: string;
  caption: string;
  href?: string;
  bento: string;
};

function EditorialTile({
  spot,
  reduceMotion,
}: {
  spot: ResolvedEditorialSpot;
  reduceMotion: boolean;
}) {
  const im = spot.imageUrl;
  const href = spot.href ?? "#pillars";
  const isFeature = spot.bento === "feature";

  const inner = (
    <>
      {im ? (
        <Image
          src={im}
          alt=""
          fill
          className="object-cover transition duration-300 ease-out group-hover:scale-[1.03]"
          sizes={
            isFeature
              ? "(min-width: 1024px) 50vw, 100vw"
              : "(min-width: 1024px) 25vw, 50vw"
          }
        />
      ) : (
        <div
          className="absolute inset-0 bg-[linear-gradient(160deg,color-mix(in_srgb,var(--color-hmm-navy)_75%,var(--color-hmm-navy-deep))_0%,color-mix(in_srgb,var(--color-hmm-navy-deep)_80%,var(--color-hmm-navy-muted))_100%)]"
          aria-hidden
        />
      )}
      <div
        className="absolute inset-0 bg-gradient-to-t from-[color-mix(in_srgb,var(--color-hmm-navy-deep)_62%,transparent)] via-[color-mix(in_srgb,var(--color-hmm-navy-deep)_8%,transparent)] to-transparent"
        aria-hidden
      />
      <div className="absolute right-0 bottom-0 left-0 p-3 sm:p-4">
        <span className="hmm-sans inline-block rounded-sm border border-white/20 bg-[color-mix(in_srgb,var(--color-hmm-navy-deep)_45%,rgba(0,0,0,0.2))] px-2 py-0.5 text-[0.6rem] font-bold tracking-[0.14em] text-[color-mix(in_srgb,var(--color-hmm-cream)_92%,var(--color-hmm-white))] uppercase shadow-sm backdrop-blur-sm sm:text-[0.65rem]">
          {spot.tag}
        </span>
        <p className="hmm-sans mt-2 text-sm leading-snug font-semibold text-white drop-shadow-sm sm:text-[0.95rem]">
          {spot.caption}
        </p>
      </div>
    </>
  );

  const cardClass =
    "hmm-editorial-tile group relative block h-full min-h-[12rem] overflow-hidden rounded-2xl border border-white/20 bg-[color-mix(in_srgb,var(--color-hmm-navy-deep)_55%,var(--color-hmm-navy))] shadow-[0_6px_28px_color-mix(in_srgb,var(--color-hmm-black)_28%,transparent),inset_0_1px_0_0_color-mix(in_srgb,var(--color-hmm-white)_8%,transparent)] ring-1 ring-white/5 transition duration-300 ease-out hover:-translate-y-0.5 hover:border-white/30 hover:shadow-[0_18px_44px_color-mix(in_srgb,var(--color-hmm-black)_36%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-hmm-yellow)] sm:min-h-[13.5rem]";

  if (reduceMotion) {
    return (
      <Link href={href} className={cardClass}>
        {inner}
      </Link>
    );
  }

  return (
    <motion.div
      className="h-full min-h-0"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={href} className={cardClass}>
        {inner}
      </Link>
    </motion.div>
  );
}

type Props = {
  /** Image paths resolved on the server (Node `publicFileExists` is not available on the client). */
  spots: readonly ResolvedEditorialSpot[];
};

export function ExternalEditorialGrid({ spots }: Props) {
  const reduceMotion = useReducedMotion() ?? false;
  
  if (!spots || spots.length === 0) return null;

  const featureSpot = spots.find(spot => spot.bento === 'feature') || spots[0];
  const remainingSpots = spots.filter(spot => spot !== featureSpot);

  return (
    <section
      id="editorial"
      className="hmm-chapter-dark hmm-editorial-chapter relative scroll-mt-[4.5rem] overflow-hidden border-y border-white/15"
    >
      <div className="hmm-editorial-chapter__mesh" aria-hidden />
      <div className="relative z-[1] mx-auto max-w-[86rem] px-4 py-[var(--hmm-section-y-md)] sm:px-8">
        <div className="hmm-eyebrow-rule hmm-eyebrow-rule--cool text-white/65">
          <p className="hmm-type-eyebrow text-[color-mix(in_srgb,var(--color-hmm-cream)_88%,white)]">
            Spotlight
          </p>
        </div>
        <h2 className="hmm-type-section mt-2 max-w-[20ch] text-balance text-[color-mix(in_srgb,var(--color-hmm-cream)_96%,white)]">
          Kilas karya &amp; solidaritas
        </h2>
        <p className="hmm-sans mt-3 max-w-xl text-sm leading-relaxed font-medium text-white/80 sm:text-[0.95rem]">
          Ubah pikiranmu sebelum masuk ke narasi pilar.
        </p>

        <div className="mt-10 grid min-h-0 auto-rows-fr grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-4 lg:grid-rows-2 lg:gap-5">
          {featureSpot && (
            <div className="min-h-[16rem] lg:col-span-2 lg:row-span-2 lg:min-h-[22rem]">
              <EditorialTile spot={featureSpot} reduceMotion={reduceMotion} />
            </div>
          )}
          {remainingSpots.map((spot, i) => (
            <div
              key={spot.id || i}
              className={
                i % 2 === 0
                  ? "min-h-[12rem] lg:min-h-[10.5rem]"
                  : "min-h-[12rem] lg:min-h-[12.5rem]"
              }
            >
              <EditorialTile spot={spot} reduceMotion={reduceMotion} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
