import { ExternalReveal } from "./external-reveal";

type Props = { misi?: any[] };

export function ExternalMisiSection({ misi = [] }: Props) {
  const groups = [
    { label: "Fondasi", range: [0, 2] as const },
    { label: "Strategi", range: [3, 5] as const },
    { label: "Tata Kelola", range: [6, 7] as const },
  ];

  return (
    <section
      id="misi"
      className="hmm-chapter-dark hmm-section-y-lg relative scroll-mt-[4.5rem] overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-[var(--color-hmm-navy-deep)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,color-mix(in_srgb,var(--color-hmm-navy)_40%,transparent),transparent_65%)]"
        aria-hidden
      />
      <div className="relative z-10 mx-auto max-w-[86rem] px-4 sm:px-8">
        <div className="hmm-eyebrow-rule text-white/75">
          <p className="hmm-type-eyebrow text-[var(--color-hmm-cream)]">
            Arah kerja
          </p>
        </div>
        <h2 className="hmm-type-section mt-2 text-white">Misi</h2>
        <p className="hmm-sans mt-3 max-w-xl text-sm font-medium text-white/70 sm:text-[0.95rem]">
          Delapan fokus
        </p>

        <ExternalReveal className="mt-10 space-y-7 md:mt-12 md:space-y-9">
          {groups.map((group) => (
            <section key={group.label} className="hmm-misi-group">
              <div className="hmm-misi-group__head">
                <h3 className="hmm-misi-group__title">{group.label}</h3>
              </div>
              <ol className="m-0 list-none divide-y divide-white/12 border-y border-white/12 p-0">
                {misi
                  .slice(group.range[0], group.range[1] + 1)
                  .map((item, localIdx) => {
                    const index = group.range[0] + localIdx;
                    const n = String(index + 1).padStart(2, "0");
                    return (
                      <li key={item.id || index} className="hmm-misi-row py-5 sm:py-6">
                        <div className="grid items-start gap-4 sm:grid-cols-[auto_1fr] sm:gap-6">
                          <span
                            className="hmm-title text-2xl font-bold text-[var(--color-hmm-cream)] tabular-nums sm:text-[1.65rem]"
                            aria-hidden
                          >
                            {n}
                          </span>
                          <div>
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
