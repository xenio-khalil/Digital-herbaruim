"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getCloudinaryImageUrl } from "@/lib/cloudinary";
import { useAuth } from "@/components/AuthProvider";
import { normalizePlant, normalizeStringArray, PLANT_STATUS } from "@/lib/plants";
import { VERIFICATION_STATUS } from "@/lib/verification";
import { PlantStatusBadge } from "@/components/plants/PlantStatusBadge";

export default function ReviewSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const { isReviewer, isAdmin, isProfessor, profile, loading: authLoading } = useAuth();
  const id = typeof params?.id === "string" ? params.id : params?.id?.[0];

  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");

  useEffect(() => {
    if (!id || authLoading) return;
    if (!isReviewer) {
      router.replace("/login?returnTo=/review");
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "plants", id));
        if (cancelled) return;
        if (!snap.exists()) {
          setError("Submission not found.");
          return;
        }
        setPlant(normalizePlant({ id: snap.id, ...snap.data() }));
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("Could not load submission.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, authLoading, isReviewer, router]);

  async function handleApprove() {
    if (!plant || !profile) return;
    setBusy(true);
    setError("");

    const reviewerName = profile.displayName || profile.email || "Reviewer";
    const verificationStatus =
      isProfessor && !isAdmin
        ? VERIFICATION_STATUS.PROFESSOR_REVIEWED
        : VERIFICATION_STATUS.VERIFIED;

    try {
      await updateDoc(doc(db, "plants", plant.id), {
        status: PLANT_STATUS.APPROVED,
        reviewedBy: reviewerName,
        approvedBy: reviewerName,
        approvedAt: serverTimestamp(),
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        verificationStatus,
        contributorId: plant.submittedBy?.uid || plant.contributorId || "",
        contributorName: plant.submittedBy?.name || plant.contributorName || "",
        reviewerNotes: "",
      });

      router.push(`/plants/${plant.id}`);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Could not approve submission.");
      setBusy(false);
    }
  }

  async function handleReject() {
    if (!plant || !profile) return;
    if (!reviewNotes.trim()) {
      setError("Please provide review notes when rejecting a submission.");
      return;
    }

    setBusy(true);
    setError("");

    const reviewerName = profile.displayName || profile.email || "Reviewer";

    try {
      await updateDoc(doc(db, "plants", plant.id), {
        status: PLANT_STATUS.REJECTED,
        reviewerNotes: reviewNotes.trim(),
        reviewedBy: reviewerName,
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      router.push("/review");
    } catch (e) {
      console.error(e);
      setError(e?.message || "Could not reject submission.");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/review" className="mb-6 inline-block text-sm font-semibold text-emerald-800 hover:underline">
          ← Review queue
        </Link>

        {loading && <p className="text-emerald-800">Loading submission…</p>}
        {error && !plant && (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-red-800">{error}</p>
        )}

        {plant && (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
            <article className="space-y-6">
              <header className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-serif text-3xl font-bold text-emerald-950">
                    {plant.plantName || "Untitled"}
                  </h1>
                  <PlantStatusBadge status={plant.status} />
                </div>
                <p className="mt-2 text-xl italic text-emerald-800">
                  {plant.scientificName || "—"}
                </p>
                <p className="mt-3 text-sm text-emerald-700">
                  Submitted by{" "}
                  <strong>{plant.submittedBy?.name || plant.submittedBy?.email}</strong>
                </p>
              </header>

              {plant.imageUrl ? (
                <div className="relative min-h-[280px] overflow-hidden rounded-3xl border border-emerald-100 bg-stone-50">
                  <Image
                    src={getCloudinaryImageUrl(plant.imageUrl, "w_1200,c_limit,q_auto")}
                    alt={plant.plantName || "Specimen"}
                    width={1200}
                    height={900}
                    className="mx-auto h-auto max-h-[70vh] w-auto max-w-full object-contain"
                  />
                </div>
              ) : null}

              <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                  Description
                </h2>
                <p className="mt-3 whitespace-pre-wrap leading-relaxed text-emerald-950">
                  {plant.description || "—"}
                </p>
              </section>

              {normalizeStringArray(plant.medicinalProperties).length > 0 ? (
                <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                    Medicinal properties
                  </h2>
                  <p className="mt-2 text-emerald-900">
                    {normalizeStringArray(plant.medicinalProperties).join(", ")}
                  </p>
                </section>
              ) : null}
            </article>

            <aside className="space-y-4 lg:sticky lg:top-24">
              <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
                <h2 className="font-serif text-lg font-bold text-emerald-950">Academic decision</h2>
                <p className="mt-2 text-sm text-emerald-800">
                  Approving publishes this record to the public herbarium with verification metadata.
                </p>

                <label className="mt-4 block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-emerald-600">
                    Review notes (required for rejection)
                  </span>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-600/25"
                    placeholder="Scientific feedback for the contributor…"
                  />
                </label>

                {error ? (
                  <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
                ) : null}

                <div className="mt-4 space-y-2">
                  <button
                    type="button"
                    disabled={busy || plant.status !== PLANT_STATUS.PENDING}
                    onClick={handleApprove}
                    className="w-full rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
                  >
                    {busy ? "Processing…" : "Approve & publish"}
                  </button>
                  <button
                    type="button"
                    disabled={busy || plant.status !== PLANT_STATUS.PENDING}
                    onClick={handleReject}
                    className="w-full rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-800 transition hover:bg-red-100 disabled:opacity-60"
                  >
                    Reject with notes
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
