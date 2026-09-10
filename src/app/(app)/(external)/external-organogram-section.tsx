'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';

type OrganogramCard = {
  title: string;
  imageUrl: string;
  detailType: string;
  featuredDetail?: any;
  rosterDetail?: any;
  isPrince?: boolean;
};

type Props = {
  items: OrganogramCard[];
};

type Group = {
  key: string;
  label: string;
  description: string;
  tone?: 'regular' | 'subtle';
  cardSize?: 'lead' | 'regular' | 'compact';
  cardLabel: 'Core Role' | 'Unit';
  items: OrganogramCard[];
};

function TextWithBold({ text }: { text: string }) {
  const segments = text.split(/(\*\*.+?\*\*)/g);
  return (
    <>
      {segments.map((seg, i) => {
        const m = /^\*\*(.+)\*\*$/.exec(seg);
        if (m) {
          return (
            <strong
              key={i}
              className="font-semibold text-[color-mix(in_srgb,var(--color-hmm-cream)_96%,white)]"
            >
              {m[1]}
            </strong>
          );
        }
        return <span key={i}>{seg}</span>;
      })}
    </>
  );
}

function OrganogramModalDetailBody({ item }: { item: OrganogramCard }) {
  if (item.detailType === 'featured' && item.featuredDetail) {
    return (
      <>
        <p className="hmm-organogram-modal__tagline mt-4">{item.featuredDetail.tagline}</p>
        <ul className="hmm-organogram-modal__people mt-5 space-y-3">
          {item.featuredDetail.people?.map((row: any, i: number) => (
            <li key={`${row.role}-${row.name}-${i}`}>
              <p className="text-[0.65rem] font-bold tracking-[0.14em] text-white/55 uppercase">
                {row.role}
              </p>
              <p className="mt-1 text-base font-semibold text-white/95">{row.name}</p>
            </li>
          ))}
        </ul>
        <div className="mt-5 space-y-3 border-t border-white/10 pt-5">
          {item.featuredDetail.paragraphs?.map((paragraph: any, i: number) => (
            <p
              key={i}
              className="hmm-type-prose text-sm leading-relaxed text-white/78 sm:text-[0.95rem]"
            >
              <TextWithBold text={paragraph.paragraph || paragraph} />
            </p>
          ))}
        </div>
      </>
    );
  }

  if (item.detailType === 'roster' && item.rosterDetail) {
    return (
      <>
        <p className="hmm-organogram-card__kicker mt-4">Susunan</p>
        <dl className="hmm-organogram-modal__roster mt-3 space-y-4">
          {item.rosterDetail.rows?.map((row: any, i: number) => (
            <div key={`${row.role}-${row.name}-${i}`}>
              <dt className="text-[0.68rem] font-bold tracking-widest text-white/55 uppercase">
                {row.role}
              </dt>
              <dd className="mt-1 text-sm font-semibold text-white/92">{row.name}</dd>
            </div>
          ))}
        </dl>
      </>
    );
  }

  return (
    <p className="hmm-type-prose mt-4 text-sm leading-relaxed text-white/78">
      Detail untuk posisi ini belum dipublikasikan.
    </p>
  );
}

function splitGroups(items: OrganogramCard[]): {
  external: Group;
  leadership: Group;
  internalGroups: Group[];
} {
  const externalTitles = new Set(['DPA', 'SENATOR', 'RCKT']);
  const external = items.filter((item) => externalTitles.has(item.title));
  const internal = items.filter((item) => !externalTitles.has(item.title));

  // extract Prince (marked as isPrince or first item as fallback)
  const prince = internal.find((item) => item.isPrince) || internal[0];
  const otherInternal = internal.filter((item) => item !== prince);

  const externalGroup: Group = {
    key: 'external',
    label: 'External & Advisory Bodies',
    description: '',
    tone: 'subtle',
    cardSize: 'regular',
    cardLabel: 'Core Role',
    items: external,
  };
  const leadershipGroup: Group = {
    key: 'leadership',
    label: 'Leadership Core',
    description: 'Pimpinan inti kabinet.',
    cardSize: 'lead',
    cardLabel: 'Core Role',
    items: prince ? [prince] : [],
  };
  const directingGroup: Group = {
    key: 'directing',
    label: 'Directing',
    description: 'Bureau dan department heads yang mengarahkan strategi.',
    cardSize: 'regular',
    cardLabel: 'Unit',
    items: otherInternal.slice(0, 8),
  };
  const executingSupportingGroup: Group = {
    key: 'executing-supporting',
    label: 'Executing & Supporting',
    description: 'Sub-bureau dan divisi pelaksana, dikelompokkan per unit induk.',
    cardSize: 'compact',
    cardLabel: 'Unit',
    items: otherInternal.slice(8),
  };
  return {
    external: externalGroup,
    leadership: leadershipGroup,
    internalGroups: [directingGroup, executingSupportingGroup].filter(
      (group) => group.items.length > 0,
    ),
  };
}

function OrganogramCardButton({
  item,
  cardLabel,
  cardSize = 'regular',
  subtle = false,
  onClick,
}: {
  item: OrganogramCard;
  cardLabel: 'Core Role' | 'Unit';
  cardSize?: 'lead' | 'regular' | 'compact';
  subtle?: boolean;
  onClick: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const title = item.title;
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`hmm-organogram-card hmm-organogram-card--${cardSize} ${subtle ? 'hmm-organogram-card--external' : ''} text-left`}
    >
      <div className="hmm-organogram-card__media">
        {loading ? (
          <span className="hmm-organogram-card__loading" aria-hidden>
            Compiling
            <span className="hmm-organogram-card__dot" />
          </span>
        ) : null}
        <Image
          src={item.imageUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 520px) 100vw, (max-width: 1280px) 50vw, 25vw"
          onLoadingComplete={() => setLoading(false)}
        />
        <div className="hmm-organogram-card__overlay" aria-hidden />
        <div className="hmm-organogram-card__content">
          <p className="hmm-organogram-card__kicker">{cardLabel}</p>
          <h4 className="hmm-organogram-card__title">
            <span>{title}</span>
          </h4>
          <span className="hmm-organogram-card__detail-cta">
            Lihat Detail <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </button>
  );
}

export function ExternalOrganogramSection({ items }: Props) {
  const [active, setActive] = useState<OrganogramCard | null>(null);
  const { external, leadership, internalGroups } = useMemo(() => splitGroups(items), [items]);

  return (
    <section
      id="organogram"
      className="hmm-chapter-dark hmm-section-y-lg relative scroll-mt-[4.5rem] overflow-hidden"
    >
      <div className="absolute inset-0 bg-[var(--color-hmm-navy-deep)]" />
      <div className="hmm-about-organogram-bg absolute inset-0" />
      <div className="relative z-10 mx-auto max-w-[86rem] px-4 sm:px-8">
        <div className="hmm-eyebrow-rule text-white/75">
          <p className="hmm-type-eyebrow text-[var(--color-hmm-cream)]">
            People behind the cabinet
          </p>
        </div>
        <h2 className="hmm-type-section mt-2 text-white">Organogram</h2>

        {leadership.items.length > 0 ? (
          <div className="mt-8 lg:mt-12">
            <div className="hmm-organogram-group-head">
              <h3 className="hmm-organogram-group-title">{leadership.label}</h3>
              {leadership.description ? (
                <p className="hmm-organogram-group-desc">{leadership.description}</p>
              ) : null}
            </div>
            <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(16rem,20rem))] justify-center gap-4">
              {leadership.items.map((item) => (
                <OrganogramCardButton
                  key={item.title}
                  item={item}
                  cardLabel={leadership.cardLabel}
                  onClick={() => setActive(item)}
                />
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-8 space-y-10 lg:mt-12">
          {internalGroups.map((group) => (
            <div
              key={group.key}
              className={group.cardSize === 'compact' ? 'hmm-organogram-subtier' : ''}
            >
              <div className="hmm-organogram-group-head">
                <h3 className="hmm-organogram-group-title">{group.label}</h3>
                {group.description ? (
                  <p className="hmm-organogram-group-desc">{group.description}</p>
                ) : null}
              </div>

              <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(13rem,1fr))] justify-center gap-4 md:grid-cols-4">
                {group.items.map((item) => (
                  <OrganogramCardButton
                    key={item.title}
                    item={item}
                    cardLabel={group.cardLabel}
                    cardSize={group.cardSize}
                    onClick={() => setActive(item)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {external.items.length > 0 ? (
          <div className="mt-10 lg:mt-12">
            <div className="hmm-organogram-group-head">
              <h3 className="hmm-organogram-group-title">{external.label}</h3>
            </div>
            <div className="hmm-organogram-external-separator" aria-hidden />
            <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(11.5rem,13.5rem))] justify-center gap-4">
              {external.items.map((item) => (
                <OrganogramCardButton
                  key={item.title}
                  item={item}
                  cardLabel={external.cardLabel}
                  subtle
                  onClick={() => setActive(item)}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {active ? (
        <div
          className="hmm-organogram-modal"
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
        >
          <button
            type="button"
            className="hmm-organogram-modal__backdrop"
            onClick={() => setActive(null)}
            aria-label="Close details"
          />
          <div className="hmm-organogram-modal__panel">
            <div className="hmm-organogram-modal__media">
              <Image
                src={active.imageUrl}
                alt={active.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
            <div className="hmm-organogram-modal__content">
              <div className="hmm-organogram-modal__scroll">
                <p className="hmm-organogram-card__kicker">Position Detail</p>
                <h4 className="hmm-type-subsection mt-2 text-white">{active.title}</h4>
                <OrganogramModalDetailBody item={active} />
              </div>
              <button
                type="button"
                className="hmm-nav-signin mt-6 shrink-0"
                onClick={() => setActive(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
