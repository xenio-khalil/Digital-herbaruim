"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { collection, deleteDoc, doc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAdminSession } from "@/lib/useAdminSession";

function plantMatchesQuery(plant, q) {
  if (!q) return true;
  const hay = [
    plant.plantName,
    plant.scientificName,
    plant.family,
    plant.location,
    plant.collector,
    plant.description,
    plant.date,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

export default function Home() {
  const { isAdmin } = useAdminSession();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPlants = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return plants.filter((p) => plantMatchesQuery(p, q));
  }, [plants, searchQuery]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const q = query(collection(db, "plants"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (!cancelled) setPlants(rows);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setError(
            "Could not load plants. Check Firestore rules and that the collection exists.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDelete(plant) {
    const label = plant.plantName || "this plant";
    const ok = window.confirm(
      `Remove "${label}" from the herbarium?\n\nThis will delete the Firestore record. If Cloudinary is configured on the server, the image file will be removed too.`,
    );
    if (!ok) return;

    setDeletingId(plant.id);
    try {
      await deleteDoc(doc(db, "plants", plant.id));
      setPlants((prev) => prev.filter((p) => p.id !== plant.id));

      if (plant.imagePublicId) {
        try {
          await fetch("/api/cloudinary/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicId: plant.imagePublicId }),
          });
        } catch {
          /* image may remain in Cloudinary; record is already gone */
        }
      }
    } catch (e) {
      console.error(e);
      window.alert("Could not delete this plant. Check Firestore security rules and try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10 flex flex-col gap-6 rounded-3xl border border-emerald-100/80 bg-white/90 p-8 shadow-sm backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Digital Herbarium
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
              Plant collection
            </h1>
            <p className="mt-3 max-w-xl text-emerald-800/90">
              A calm, botanical gallery of your specimens—linked to your pharmacy studies notes in
              Firestore.
            </p>
          </div>
          {isAdmin ? (
            <Link
              href="/upload"
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-800"
            >
              Add specimen
            </Link>
          ) : null}
        </header>

        <section className="mb-8 rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 shadow-sm sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Community contribution
          </p>
          <p className="mt-3 text-base leading-relaxed text-emerald-900">
            To contribute specimens, please contact the KAS Team (Khalil, Amina, or Sara).
          </p>
        </section>

        {loading && (
          <p className="rounded-2xl border border-emerald-100 bg-white px-6 py-8 text-emerald-800">
            Loading plants…
          </p>
        )}

        {error && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-800">
            {error}
          </p>
        )}

        {!loading && !error && plants.length === 0 && (
          <div className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/50 px-8 py-16 text-center text-emerald-900">
            <p className="text-lg font-medium">No plants yet.</p>
            <p className="mt-2 text-emerald-800/90">
              Use <span className="font-semibold">Add specimen</span> to upload a photo to
              Cloudinary and save the record in Firestore.
            </p>
          </div>
        )}

        {!loading && !error && plants.length > 0 && (
          <div className="mb-8">
            <label htmlFor="plant-search" className="sr-only">
              Search plants
            </label>
            <div className="relative">
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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, scientific name, family, location, collector, or notes…"
                className="w-full rounded-2xl border border-emerald-200 bg-white py-3.5 pl-12 pr-4 text-emerald-950 shadow-sm outline-none ring-emerald-600/25 transition placeholder:text-emerald-600/50 focus:border-emerald-400 focus:ring-2"
                autoComplete="off"
              />
            </div>
            {searchQuery.trim() && (
              <p className="mt-2 text-sm text-emerald-700">
                Showing {filteredPlants.length} of {plants.length} specimen{plants.length === 1 ? "" : "s"}
              </p>
            )}
          </div>
        )}

        {!loading && !error && plants.length > 0 && filteredPlants.length === 0 && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 px-8 py-12 text-center text-emerald-900">
            <p className="text-lg font-medium">No matches for your search.</p>
            <p className="mt-2 text-emerald-800/90">Try another keyword or clear the search box.</p>
          </div>
        )}

        {!loading && !error && plants.length > 0 && filteredPlants.length > 0 && (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPlants.map((plant) => (
              <li key={plant.id}>
                <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm ring-emerald-100 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-2">
                  <Link
                    href={`/plants/${plant.id}`}
                    className="flex min-h-0 flex-1 flex-col rounded-t-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                  >
                    <div className="relative aspect-[4/3] bg-emerald-100">
                      {plant.imageUrl ? (
                        <Image
                          src={plant.imageUrl}
                          alt={plant.plantName || "Plant"}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition duration-300 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-emerald-700">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1 p-5">
                      <h2 className="text-lg font-bold text-emerald-950">
                        {plant.plantName || "Untitled"}
                      </h2>
                      <p className="text-sm italic text-emerald-700">
                        {plant.scientificName || "Scientific name not set"}
                      </p>
                      {plant.family ? (
                        <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
                          Family: {plant.family}
                        </p>
                      ) : null}
                      {plant.location ? (
                        <p className="mt-2 text-xs text-emerald-600/90">{plant.location}</p>
                      ) : null}
                      <p className="mt-3 text-xs font-medium text-emerald-600">Open full record →</p>
                    </div>
                  </Link>
                  {isAdmin ? (
                    <div className="grid grid-cols-2 gap-3 border-t border-emerald-100 px-5 py-4">
                      <Link
                        href={`/plants/${plant.id}/edit`}
                        className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-center text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        disabled={deletingId === plant.id}
                        onClick={() => handleDelete(plant)}
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-800 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === plant.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  ) : null}
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
