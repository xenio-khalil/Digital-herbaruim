import Link from "next/link";

/**
 * @param {{
 *   plant: Record<string, unknown>,
 *   isAdmin?: boolean,
 *   deleting?: boolean,
 *   onDelete?: () => void,
 *   showIdentity?: boolean,
 * }} props
 */
export function SpecimenSidebar({ plant, isAdmin, deleting, onDelete, showIdentity = true }) {
  const facts = [
    { label: "Scientific name", value: plant.scientificName, italic: true },
    { label: "Family", value: plant.family },
    { label: "Location", value: plant.location },
    { label: "Collector", value: plant.collector },
    { label: "Collection date", value: plant.date },
  ];

  return (
    <aside className="space-y-5 lg:sticky lg:top-24">
      {showIdentity ? (
        <div className="rounded-3xl border border-emerald-100/80 bg-gradient-to-br from-white via-white to-emerald-50/30 p-6 shadow-md backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Specimen record
          </p>
          <h1 className="mt-2 font-serif text-2xl font-bold leading-tight text-emerald-950 sm:text-3xl">
            {plant.plantName || "Untitled"}
          </h1>
          <p className="mt-2 text-lg italic text-emerald-800">
            {plant.scientificName || "—"}
          </p>
        </div>
      ) : null}

      <div className="rounded-3xl border border-emerald-100/80 bg-white/95 p-6 shadow-md backdrop-blur">
        <header className="mb-5 border-b border-emerald-100 pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">At a glance</p>
          <h2 className="mt-1 font-serif text-lg font-bold text-emerald-950">Quick facts</h2>
        </header>
        <dl className="space-y-4">
          {facts.slice(1).map(({ label, value, italic }) => (
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
      </div>

      {isAdmin ? (
        <section className="flex flex-col gap-3 rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
          <Link
            href={`/plants/${plant.id}/edit`}
            className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-center text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100"
          >
            Edit specimen
          </Link>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-800 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete specimen"}
          </button>
        </section>
      ) : null}
    </aside>
  );
}
