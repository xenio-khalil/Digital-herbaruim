import { PLANT_STATUS_ICONS, PLANT_STATUS_LABELS, normalizePlantStatus } from "@/lib/plants";

/**
 * @param {{ status: unknown, showIcon?: boolean }} props
 */
export function PlantStatusBadge({ status, showIcon = true }) {
  const normalized = normalizePlantStatus(status);
  const styles = {
    draft: "border-stone-200 bg-stone-50 text-stone-700",
    pending: "border-amber-200 bg-amber-50 text-amber-900",
    approved: "border-emerald-200 bg-emerald-50 text-emerald-900",
    rejected: "border-red-200 bg-red-50 text-red-800",
  };

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
        styles[normalized],
      ].join(" ")}
    >
      {showIcon ? <span aria-hidden>{PLANT_STATUS_ICONS[normalized]}</span> : null}
      <span>{PLANT_STATUS_LABELS[normalized]}</span>
    </span>
  );
}
