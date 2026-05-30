/**
 * @param {{ plant: Record<string, unknown> }} props
 */
export function SpecimenRecordCard({ plant }) {
  const facts = [
    { label: "Family", value: plant.family },
    { label: "Location", value: plant.location },
    { label: "Collector", value: plant.collector },
    { label: "Collection date", value: plant.date },
  ];

  return (
    <section className="rounded-3xl border border-emerald-100/80 bg-white/95 p-6 shadow-md backdrop-blur">
      <header className="mb-5 border-b border-emerald-100 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
          Specimen record
        </p>
        <h1 className="mt-2 font-serif text-2xl font-bold leading-tight text-emerald-950 sm:text-3xl">
          {plant.plantName || "Untitled"}
        </h1>
        <p className="mt-2 text-lg italic text-emerald-800">{plant.scientificName || "—"}</p>
      </header>

      <dl className="space-y-4">
        {facts.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-600">
              {label}
            </dt>
            <dd className="mt-1 text-sm font-medium text-emerald-950">
              {value?.toString()?.trim() || "—"}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
