import { formatVerificationDate, normalizeVerificationStatus } from "@/lib/verification";
import { VERIFICATION_STATUS } from "@/lib/verification";
import { VerificationBadge } from "@/components/verification/VerificationBadge";

/**
 * @param {{ plant: Record<string, unknown> }} props
 */
export function ContributorPanel({ plant }) {
  const status = normalizeVerificationStatus(plant.verificationStatus);
  if (!status) return null;

  const approvedDate = formatVerificationDate(plant.approvedAt);
  const isOfficial = status === VERIFICATION_STATUS.OFFICIAL;

  return (
    <section className="rounded-3xl border border-emerald-100/80 bg-gradient-to-br from-white via-white to-emerald-50/40 p-6 shadow-md">
      <header className="mb-4 flex flex-wrap items-center gap-3">
        <VerificationBadge status={status} />
      </header>

      <dl className="space-y-3 text-sm">
        {!isOfficial && plant.contributorName ? (
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-600">
              Contributed by
            </dt>
            <dd className="mt-1 font-medium text-emerald-950">{plant.contributorName}</dd>
          </div>
        ) : null}

        {isOfficial && plant.approvedBy ? (
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-600">
              Added by
            </dt>
            <dd className="mt-1 font-medium text-emerald-950">{plant.approvedBy}</dd>
          </div>
        ) : null}

        {plant.reviewedBy ? (
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-600">
              Reviewed by
            </dt>
            <dd className="mt-1 font-medium text-emerald-950">{plant.reviewedBy}</dd>
          </div>
        ) : null}

        {!isOfficial && plant.approvedBy ? (
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-600">
              Approved by
            </dt>
            <dd className="mt-1 font-medium text-emerald-950">{plant.approvedBy}</dd>
          </div>
        ) : null}

        {approvedDate ? (
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-600">
              Verified
            </dt>
            <dd className="mt-1 font-medium text-emerald-950">{approvedDate}</dd>
          </div>
        ) : null}

        <div className="border-t border-emerald-100 pt-3">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-600">
            Published by
          </dt>
          <dd className="mt-1 font-medium text-emerald-950">KAS Digital Herbarium</dd>
        </div>
      </dl>
    </section>
  );
}
