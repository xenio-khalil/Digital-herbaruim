import { normalizeStringArray } from "@/lib/plants";

/**
 * @param {{ properties: unknown }} props
 */
export function MedicinalPropertiesBadges({ properties }) {
  const items = normalizeStringArray(properties);
  if (items.length === 0) return null;

  return (
    <section>
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
          Pharmacology
        </p>
        <h2 className="mt-1 text-xl font-bold text-emerald-950">Medicinal properties</h2>
      </header>
      <ul className="flex flex-wrap gap-2.5">
        {items.map((prop) => (
          <li key={prop}>
            <span className="inline-flex rounded-full border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white px-4 py-2 text-sm font-semibold text-emerald-900 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
              {prop}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
