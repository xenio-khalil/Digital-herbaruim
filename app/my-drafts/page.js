"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { normalizePlant } from "@/lib/plants";
import { DraftGalleryCard } from "@/components/plants/DraftGalleryCard";

export default function MyDraftsPage() {
  const router = useRouter();
  const { isSignedIn, user, loading: authLoading } = useAuth();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!isSignedIn || !user) {
      router.replace("/login?returnTo=/my-drafts");
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const q = query(
          collection(db, "plants"),
          where("submittedBy.uid", "==", user.uid),
        );
        const snap = await getDocs(q);
        const rows = snap.docs
          .map((d) => normalizePlant({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const ta = a.updatedAt?.toMillis?.() ?? a.createdAt?.toMillis?.() ?? 0;
            const tb = b.updatedAt?.toMillis?.() ?? b.createdAt?.toMillis?.() ?? 0;
            return tb - ta;
          });
        if (!cancelled) setPlants(rows);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("Could not load your submissions.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isSignedIn, user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10 flex flex-col gap-4 rounded-3xl border border-emerald-100/80 bg-white/90 p-8 shadow-sm sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Private gallery
            </p>
            <h1 className="mt-2 font-serif text-3xl font-bold text-emerald-950">My drafts</h1>
            <p className="mt-2 text-emerald-800/90">
              Your specimens in the academic review pipeline — styled like the public collection.
            </p>
          </div>
          <Link
            href="/submit"
            className="inline-flex justify-center rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-emerald-800"
          >
            New submission
          </Link>
        </header>

        {loading && (
          <p className="rounded-2xl border border-emerald-100 bg-white px-6 py-8 text-emerald-800">
            Loading your gallery…
          </p>
        )}

        {error && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-800">{error}</p>
        )}

        {!loading && !error && plants.length === 0 && (
          <div className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/50 px-8 py-16 text-center">
            <p className="text-lg font-medium text-emerald-900">No submissions yet.</p>
            <p className="mt-2 text-emerald-800/90">Start a new specimen record to contribute.</p>
          </div>
        )}

        {!loading && !error && plants.length > 0 && (
          <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {plants.map((plant) => (
              <li key={plant.id}>
                <DraftGalleryCard plant={plant} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
