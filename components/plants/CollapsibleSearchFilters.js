"use client";

import { useEffect, useId, useState } from "react";
import { PlantSearchFilters } from "@/components/plants/PlantSearchFilters";

/**
 * @param {{
 *   searchQuery: string,
 *   onSearchChange: (value: string) => void,
 *   options: { families: string[], locations: string[], medicinalProperties: string[], tags: string[] },
 *   filters: { families: string[], locations: string[], medicinalProperties: string[], tags: string[] },
 *   onFiltersChange: (filters: object) => void,
 *   onClearFilters: () => void,
 *   initialOpen?: boolean,
 * }} props
 */
export function CollapsibleSearchFilters({
  searchQuery,
  onSearchChange,
  options,
  filters,
  onFiltersChange,
  onClearFilters,
  initialOpen = false,
}) {
  const panelId = useId();
  const [open, setOpen] = useState(initialOpen);

  const activeCount =
    filters.families.length +
    filters.locations.length +
    filters.medicinalProperties.length +
    filters.tags.length +
    (filters.verificationStatuses?.length ?? 0);

  useEffect(() => {
    if (initialOpen) setOpen(true);
  }, [initialOpen]);

  return (
    <div className="mb-8 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <label htmlFor="plant-search" className="relative min-w-0 flex-1">
          <span className="sr-only">Search plants</span>
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            id="plant-search"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search plants…"
            className="w-full rounded-2xl border border-emerald-200 bg-white py-3.5 pl-12 pr-4 text-emerald-950 shadow-sm outline-none ring-emerald-600/25 transition placeholder:text-emerald-600/50 focus:border-emerald-400 focus:ring-2"
            autoComplete="off"
          />
        </label>

        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-5 py-3.5 text-sm font-semibold text-emerald-900 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 sm:min-w-[140px]"
        >
          <span>
            Filters
            {activeCount > 0 ? ` (${activeCount})` : ""}
          </span>
          <svg
            className={[
              "h-4 w-4 text-emerald-600 transition-transform duration-300",
              open ? "rotate-180" : "rotate-0",
            ].join(" ")}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div
        id={panelId}
        className={[
          "grid transition-[grid-template-rows,opacity,margin] duration-300 ease-in-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
        aria-hidden={!open}
      >
        <div className="overflow-hidden">
          <PlantSearchFilters
            embedded
            options={options}
            filters={filters}
            onChange={onFiltersChange}
            onClear={onClearFilters}
          />
        </div>
      </div>
    </div>
  );
}
