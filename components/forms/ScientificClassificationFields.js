import { CLASSIFICATION_LABELS } from "@/lib/plants";

/**
 * @param {{ classification: Record<string, string>, onChange: (key: string, value: string) => void }} props
 */
export function ScientificClassificationFields({ classification, onChange }) {
  return (
    <fieldset className="space-y-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 p-5">
      <legend className="px-1 text-sm font-semibold text-emerald-950">Scientific classification</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        {CLASSIFICATION_LABELS.map(({ key, label }) => (
          <label key={key} className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-emerald-600">
              {label}
            </span>
            <input
              type="text"
              value={classification[key] ?? ""}
              onChange={(e) => onChange(key, e.target.value)}
              className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm text-emerald-950 outline-none ring-emerald-600/30 transition focus:border-emerald-400 focus:ring-2"
              placeholder={label}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
