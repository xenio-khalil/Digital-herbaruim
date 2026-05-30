import { formatVerificationDate, normalizeVerificationStatus, VERIFICATION_STATUS } from "@/lib/verification";
import { normalizePlantStatus, PLANT_STATUS } from "@/lib/plants";
import { VerificationBadge } from "@/components/verification/VerificationBadge";
import { PlantStatusBadge } from "@/components/plants/PlantStatusBadge";

/**
 * @param {{ plant: Record<string, unknown> }} props
 */
export function ContributionDetailsCard({ plant }) {
  const status = normalizePlantStatus(plant.status);
  const verification = normalizeVerificationStatus(plant.verificationStatus);
  const isOfficial =
    verification === VERIFICATION_STATUS.OFFICIAL ||
    (!plant.submittedBy?.uid && status === PLANT_STATUS.APPROVED);

  const approvedDate = formatVerificationDate(plant.approvedAt);

  return (
    <section className="rounded-3xl border border-emerald-100/80 bg-gradient-to-br from-white via-white to-emerald-50/30 p-6 shadow-md">
      <header className="mb-5 border-b border-emerald-100 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
          Contribution details
        </p>
      </header>

      <dl className="space-y-4 text-sm">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-600">
            Contributor
          </dt>
          <dd className="mt-1 font-medium text-emerald-950">
            {isOfficial ? "Official Collection" : plant.contributorName || plant.submittedBy?.name || "—"}
          </dd>
        </div>

        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-600">
            Submission status
          </dt>
          <dd className="mt-2">
            <PlantStatusBadge status={status} />
          </dd>
        </div>

        {plant.reviewedBy ? (
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-600">
              Reviewer
            </dt>
            <dd className="mt-1 font-medium text-emerald-950">{plant.reviewedBy}</dd>
          </div>
        ) : null}

        {approvedDate ? (
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-600">
              Validation date
            </dt>
            <dd className="mt-1 font-medium text-emerald-950">{approvedDate}</dd>
          </div>
        ) : null}

        {verification ? (
          <div>
            <dt className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-600">
              Verification level
            </dt>
            <dd>
              <VerificationBadge status={verification} />
            </dd>
          </div>
        ) : null}

        {status === PLANT_STATUS.REJECTED && plant.reviewerNotes ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-red-700">
              Reviewer notes
            </dt>
            <dd className="mt-1 text-sm text-red-900">{plant.reviewerNotes}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
