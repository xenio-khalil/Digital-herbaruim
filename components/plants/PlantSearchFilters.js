"use client";

import { VERIFICATION_FILTER_OPTIONS } from "@/lib/verification";

/**
 * @param {{
 *   embedded?: boolean,
 *   options: { families: string[], locations: string[], medicinalProperties: string[], tags: string[] },
 *   filters: { families: string[], locations: string[], medicinalProperties: string[], tags: string[], verificationStatuses?: string[] },
 *   onChange: (filters: object) => void,
 *   onClear: () => void,
 * }} props
 */
export function PlantSearchFilters({ embedded = false, options, filters, onChange, onClear }) {
  const activeCount =
    filters.families.length +
    filters.locations.length +
    filters.medicinalProperties.length +
    filters.tags.length +
    (filters.verificationStatuses?.length ?? 0);

  function toggle(category, value) {
    const current = filters[category];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [category]: next });
  }

  const groups = [
    { key: "verificationStatuses", label: "Verification", items: VERIFICATION_FILTER_OPTIONS.map((o) => o.value), itemLabels: Object.fromEntries(VERIFICATION_FILTER_OPTIONS.map((o) => [o.value, o.label])) },
    { key: "families", label: "Family", items: options.families },
    { key: "locations", label: "Location", items: options.locations },
    { key: "medicinalProperties", label: "Medicinal properties", items: options.medicinalProperties },
    { key: "tags", label: "Tags", items: options.tags },
  ];

  return (
    <aside
      className={[
        embedded
          ? "rounded-2xl border border-emerald-100 bg-white/95 p-5 shadow-sm"
          : "rounded-3xl border border-emerald-100/80 bg-white/95 p-5 shadow-sm backdrop-blur",
      ].join(" ")}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        {!embedded ? (
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-emerald-700">Filters</h2>
        ) : (
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-600">
            Refine collection
          </p>
        )}
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-emerald-700 underline-offset-2 transition hover:text-emerald-950 hover:underline"
          >
            Clear all ({activeCount})
          </button>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {groups.map(({ key, label, items, itemLabels }) =>
          items.length > 0 ? (
            <FilterGroup
              key={key}
              label={label}
              items={items}
              itemLabels={itemLabels}
              selected={filters[key] ?? []}
              onToggle={(value) => toggle(key, value)}
            />
          ) : null,
        )}

        {groups.filter((g) => g.key !== "verificationStatuses").every((g) => g.items.length === 0) ? (
          <p className="col-span-full text-sm text-emerald-700/70 sm:col-span-2 lg:col-span-5">
            No metadata filters yet. Add specimens to populate options.
          </p>
        ) : null}
      </div>
    </aside>
  );
}

function FilterGroup({ label, items, selected, onToggle, itemLabels = {} }) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-600">
        {label}
      </legend>
      <ul className="max-h-36 space-y-1 overflow-y-auto pr-1">
        {items.map((item) => {
          const checked = selected.includes(item);
          return (
            <li key={item}>
              <label
                className={[
                  "flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition",
                  checked
                    ? "bg-emerald-100 font-medium text-emerald-950"
                    : "text-emerald-800 hover:bg-emerald-50",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(item)}
                  className="h-4 w-4 rounded border-emerald-300 text-emerald-700 focus:ring-emerald-600"
                />
                <span className="truncate">{itemLabels[item] || item}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
