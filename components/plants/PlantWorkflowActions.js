"use client";

import Link from "next/link";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { isPlantOwner, PLANT_STATUS } from "@/lib/plants";

/**
 * @param {{
 *   plant: Record<string, unknown>,
 *   userId?: string,
 *   isAdmin?: boolean,
 *   isReviewer?: boolean,
 *   deleting?: boolean,
 *   onDelete?: () => void,
 * }} props
 */
export function PlantWorkflowActions({
  plant,
  userId,
  isAdmin,
  isReviewer,
  deleting,
  onDelete,
}) {
  const isOwner = isPlantOwner(plant, userId);
  const status = plant.status;
  const canEdit =
    isAdmin || (isOwner && [PLANT_STATUS.DRAFT, PLANT_STATUS.REJECTED].includes(status));
  const canDelete =
    isAdmin || (isOwner && [PLANT_STATUS.DRAFT, PLANT_STATUS.REJECTED].includes(status));
  const canSubmit =
    isOwner && [PLANT_STATUS.DRAFT, PLANT_STATUS.REJECTED].includes(status);
  const canReview = isReviewer && status === PLANT_STATUS.PENDING;

  if (!canEdit && !canDelete && !canSubmit && !canReview) return null;

  async function submitForReview() {
    if (!plant.id) return;
    const ok = window.confirm("Submit this specimen for academic review?");
    if (!ok) return;
    try {
      await updateDoc(doc(db, "plants", plant.id), {
        status: PLANT_STATUS.PENDING,
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        reviewerNotes: "",
      });
      window.location.reload();
    } catch (e) {
      console.error(e);
      window.alert("Could not submit for review.");
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
      {canSubmit ? (
        <button
          type="button"
          onClick={submitForReview}
          className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          Submit for review
        </button>
      ) : null}

      {canEdit ? (
        <Link
          href={`/plants/${plant.id}/edit`}
          className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-center text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100"
        >
          Edit {status === PLANT_STATUS.DRAFT ? "draft" : "record"}
        </Link>
      ) : null}

      {canReview ? (
        <Link
          href={`/review/${plant.id}`}
          className="rounded-xl bg-emerald-700 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          Open review panel
        </Link>
      ) : null}

      {canDelete ? (
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-800 transition hover:bg-red-100 disabled:opacity-60"
        >
          {deleting ? "Deleting…" : "Delete record"}
        </button>
      ) : null}
    </section>
  );
}
