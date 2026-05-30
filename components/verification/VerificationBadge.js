import {
  VERIFICATION_SHORT,
  VERIFICATION_STATUS,
  normalizeVerificationStatus,
} from "@/lib/verification";

const STYLES = {
  [VERIFICATION_STATUS.OFFICIAL]: {
    container:
      "border-amber-300/80 bg-gradient-to-r from-emerald-50 via-white to-amber-50/60 text-emerald-950",
    icon: "🏛",
    ring: "ring-amber-200/60",
  },
  [VERIFICATION_STATUS.VERIFIED]: {
    container: "border-emerald-300/80 bg-gradient-to-r from-emerald-50 to-white text-emerald-950",
    icon: "✓",
    ring: "ring-emerald-200/60",
  },
  [VERIFICATION_STATUS.PROFESSOR_REVIEWED]: {
    container: "border-sky-300/80 bg-gradient-to-r from-sky-50/80 to-white text-emerald-950",
    icon: "🧪",
    ring: "ring-sky-200/60",
  },
};

/**
 * @param {{ status?: unknown, compact?: boolean, className?: string }} props
 */
export function VerificationBadge({ status, compact = false, className = "" }) {
  const normalized = normalizeVerificationStatus(status);
  if (!normalized) return null;

  const style = STYLES[normalized];
  const label = compact
    ? VERIFICATION_SHORT[normalized]
    : {
        [VERIFICATION_STATUS.OFFICIAL]: "Official Herbarium Record",
        [VERIFICATION_STATUS.VERIFIED]: "Academically Verified",
        [VERIFICATION_STATUS.PROFESSOR_REVIEWED]: "Professor Reviewed",
      }[normalized];

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ring-1",
        style.container,
        style.ring,
        className,
      ].join(" ")}
    >
      <span aria-hidden>{style.icon}</span>
      <span>{label}</span>
    </span>
  );
}
