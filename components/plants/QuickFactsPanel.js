/**
 * @param {{ plant: Record<string, unknown> }} props
 */
export function QuickFactsPanel({ plant }) {
  const facts = [
    { label: "Scientific name", value: plant.scientificName, italic: true },
    { label: "Family", value: plant.family },
    { label: "Location", value: plant.location },
    { label: "Collector", value: plant.collector },
    { label: "Collection date", value: plant.date },
  ];

  return (
    <aside className="rounded-3xl border border-emerald-100/80 bg-white/95 p-6 shadow-md backdrop-blur lg:sticky lg:top-24">
      <header className="mb-5 border-b border-emerald-100 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">At a glance</p>
        <h2 className="mt-1 font-serif text-xl font-bold text-emerald-950">Quick facts</h2>
      </header>
      <dl className="space-y-4">
        {facts.map(({ label, value, italic }) => (
          <div key={label}>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-600">
              {label}
            </dt>
            <dd
              className={[
                "mt-1 text-sm font-medium text-emerald-950",
                italic ? "italic" : "",
              ].join(" ")}
            >
              {value?.toString()?.trim() || "—"}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
