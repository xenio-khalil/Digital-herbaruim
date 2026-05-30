import Link from "next/link";
import { normalizeStringArray } from "@/lib/plants";

/**
 * @param {{ tags: unknown }} props
 */
export function PlantTags({ tags }) {
  const items = normalizeStringArray(tags);
  if (items.length === 0) return null;

  return (
    <section>
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Index</p>
        <h2 className="mt-1 text-xl font-bold text-emerald-950">Tags</h2>
      </header>
      <ul className="flex flex-wrap gap-2">
        {items.map((tag) => (
          <li key={tag}>
            <Link
              href={`/?tag=${encodeURIComponent(tag)}`}
              className="inline-flex rounded-full border border-emerald-200/80 bg-white px-3.5 py-1.5 text-sm font-medium text-emerald-800 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-950 hover:shadow"
            >
              #{tag}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
