"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getCloudinaryImageUrl } from "@/lib/cloudinary";
import { useAuth } from "@/components/AuthProvider";
import { normalizePlant, PLANT_STATUS } from "@/lib/plants";
import { PlantStatusBadge } from "@/components/plants/PlantStatusBadge";

export default function ReviewDashboardPage() {
  const router = useRouter();
  const { isReviewer, loading: authLoading } = useAuth();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!isReviewer) {
      router.replace("/login?returnTo=/review");
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const q = query(
          collection(db, "plants"),
          where("status", "==", PLANT_STATUS.PENDING),
        );
        const snap = await getDocs(q);
        const rows = snap.docs
          .map((d) => normalizePlant({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.submittedAt?.toMillis?.() ?? 0) - (a.submittedAt?.toMillis?.() ?? 0));
        if (!cancelled) setPending(rows);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("Could not load pending submissions.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isReviewer, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-3xl border border-emerald-100/80 bg-white/90 p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Academic moderation
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-emerald-950">Review panel</h1>
          <p className="mt-2 text-emerald-800/90">
            Review student submissions before they are published to the public herbarium.
          </p>
        </header>

        {loading && <p className="text-emerald-800">Loading queue…</p>}
        {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-red-800">{error}</p>}

        {!loading && !error && pending.length === 0 && (
          <div className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/50 px-8 py-16 text-center">
            <p className="text-lg font-medium text-emerald-900">No submissions awaiting review.</p>
          </div>
        )}

        <ul className="space-y-4">
          {pending.map((item) => (
            <li
              key={item.id}
              className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-emerald-100 sm:h-20 sm:w-28">
                  {item.imageUrl ? (
                    <Image
                      src={getCloudinaryImageUrl(item.imageUrl, "w_200,c_fill,q_auto")}
                      alt={item.plantName || "Specimen"}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-emerald-950">{item.plantName || "Untitled"}</h2>
                    <PlantStatusBadge status={item.status} />
                  </div>
                  <p className="text-sm italic text-emerald-700">{item.scientificName || "—"}</p>
                  <p className="mt-1 text-xs text-emerald-600">
                    By {item.submittedBy?.name || item.submittedBy?.email || "Unknown"}
                  </p>
                </div>
                <Link
                  href={`/review/${item.id}`}
                  className="shrink-0 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                  Review
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
