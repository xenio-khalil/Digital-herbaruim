import { CLASSIFICATION_LABELS, normalizeScientificClassification } from "@/lib/plants";

/**
 * @param {{ classification: Record<string, unknown>, fallbackFamily?: string, compact?: boolean }} props
 */
export function ScientificClassificationCard({ classification, fallbackFamily, compact = false }) {
  const data = normalizeScientificClassification(classification);
  if (fallbackFamily && !data.family) data.family = fallbackFamily;

  const entries = CLASSIFICATION_LABELS.map(({ key, label }) => ({
    label,
    value: data[key],
  })).filter((entry) => entry.value);

  if (entries.length === 0) return null;

  return (
    <section
      className={[
        "rounded-3xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/40 shadow-sm",
        compact ? "h-full p-6 sm:p-7" : "p-6 sm:p-8",
      ].join(" ")}
    >
      <header className={compact ? "mb-4 border-b border-emerald-100 pb-3" : "mb-5 border-b border-emerald-100 pb-4"}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Taxonomy</p>
        <h2
          className={[
            "mt-1 font-serif font-bold text-emerald-950",
            compact ? "text-lg" : "text-2xl",
          ].join(" ")}
        >
          Scientific classification
        </h2>
      </header>
      <dl className={compact ? "space-y-2.5" : "grid gap-3 sm:grid-cols-2"}>
        {entries.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-emerald-100/80 bg-white/80 px-3 py-2.5 transition hover:border-emerald-200 hover:shadow-sm"
          >
            <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-600">
              {label}
            </dt>
            <dd className="mt-0.5 text-sm font-medium italic text-emerald-950">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
