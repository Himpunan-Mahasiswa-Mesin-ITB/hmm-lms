import { ExternalReveal } from './external-reveal';

type Props = { misi?: any };

export function ExternalMisiSection({ misi }: Props) {
  const allMissions =
    misi?.groups?.flatMap((group: any) =>
      group.missions
        .filter((mission: any) => mission.isActive !== false)
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
        .map((mission: any) => ({
          ...mission,
          groupTitle: group.groupTitle,
        })),
    ) || [];

  // use the group titles from CMS if available, otherwise fall back to defaults
  const displayGroups =
    misi?.groups?.length > 0
      ? misi.groups.map((group: any) => ({
          label: group.groupTitle,
          missions: group.missions
            .filter((mission: any) => mission.isActive !== false)
            .sort((a: any, b: any) => (a.order || 0) - (b.order || 0)),
        }))
      : [
          { label: 'Fondasi', missions: allMissions.slice(0, 3) },
          { label: 'Strategi', missions: allMissions.slice(3, 6) },
          { label: 'Tata Kelola', missions: allMissions.slice(6, 8) },
        ];

  return (
    <section
      id="misi"
      className="hmm-chapter-dark hmm-section-y-lg relative scroll-mt-[4.5rem] overflow-hidden"
    >
      <div className="absolute inset-0 bg-[var(--color-hmm-navy-deep)]" aria-hidden />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,color-mix(in_srgb,var(--color-hmm-navy)_40%,transparent),transparent_65%)]"
        aria-hidden
      />
      <div className="relative z-10 mx-auto max-w-[86rem] px-4 sm:px-8">
        <div className="hmm-eyebrow-rule text-white/75">
          <p className="hmm-type-eyebrow text-[var(--color-hmm-cream)]">Arah kerja</p>
        </div>
        <h2 className="hmm-type-section mt-2 text-white">{misi?.title || 'Misi'}</h2>
        <p className="hmm-sans mt-3 max-w-xl text-sm font-medium text-white/70 sm:text-[0.95rem]">
          {allMissions.length} fokus
        </p>

        <ExternalReveal className="mt-10 space-y-7 md:mt-12 md:space-y-9">
          {displayGroups.map((group: any, groupIndex: number) => (
            <section key={group.label || groupIndex} className="hmm-misi-group">
              <div className="hmm-misi-group__head">
                <h3 className="hmm-misi-group__title">{group.label}</h3>
              </div>
              <ol className="m-0 list-none divide-y divide-white/12 border-y border-white/12 p-0">
                {group.missions.map((item: any, localIdx: number) => {
                  // calculate global index for numbering
                  const globalIndex = allMissions.findIndex((m: any) => m.id === item.id);
                  const n = String(globalIndex + 1).padStart(2, '0');
                  return (
                    <li key={item.id || localIdx} className="hmm-misi-row py-5 sm:py-6">
                      <div className="grid items-start gap-4 sm:grid-cols-[auto_1fr] sm:gap-6">
                        <span
                          className="hmm-title text-2xl font-bold text-[var(--color-hmm-cream)] tabular-nums sm:text-[1.65rem] pl-2"
                          aria-hidden
                        >
                          {n}
                        </span>
                        <div className="pl-2">
                          <h4 className="hmm-sans text-base leading-snug font-bold text-white sm:text-lg">
                            {item.cardTitle}
                          </h4>
                          <p className="hmm-type-prose mt-2 max-w-3xl text-sm leading-relaxed text-[color-mix(in_srgb,var(--color-hmm-yellow)_58%,var(--color-hmm-cream))] sm:text-[0.95rem]">
                            {item.summary}
                          </p>
                          <p className="hmm-type-prose mt-2 max-w-3xl text-sm leading-relaxed text-[#94a3b8] sm:text-[0.95rem]">
                            {item.body}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </ExternalReveal>
      </div>
    </section>
  );
}
