"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { collection, deleteDoc, doc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteCloudinaryImage } from "@/lib/cloudinary";
import {
  computePlantStats,
  deriveFilterOptions,
  filterPlants,
  isPublicPlant,
  normalizePlant,
} from "@/lib/plants";
import { useAuth } from "@/components/AuthProvider";
import { CollapsibleSearchFilters } from "@/components/plants/CollapsibleSearchFilters";
import { HerbariumStats } from "@/components/plants/HerbariumStats";
import { PlantCard } from "@/components/plants/PlantCard";

const EMPTY_FILTERS = {
  families: [],
  locations: [],
  medicinalProperties: [],
  tags: [],
  verificationStatuses: [],
};

function HomeLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="rounded-2xl border border-emerald-100 bg-white px-6 py-8 text-emerald-800">
          Loading collection…
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const { isAdmin } = useAuth();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const urlHasFilters = Boolean(
    searchParams.get("tag") ||
      searchParams.get("family") ||
      searchParams.get("location") ||
      searchParams.get("property"),
  );

  useEffect(() => {
    const tag = searchParams.get("tag");
    const family = searchParams.get("family");
    const location = searchParams.get("location");
    const property = searchParams.get("property");

    setFilters({
      families: family ? [family] : [],
      locations: location ? [location] : [],
      medicinalProperties: property ? [property] : [],
      tags: tag ? [tag] : [],
      verificationStatuses: [],
    });
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const q = query(collection(db, "plants"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const rows = snap.docs
          .map((d) => normalizePlant({ id: d.id, ...d.data() }))
          .filter(isPublicPlant);
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

  const filterOptions = useMemo(() => deriveFilterOptions(plants), [plants]);
  const stats = useMemo(() => computePlantStats(plants), [plants]);

  const filteredPlants = useMemo(
    () => filterPlants(plants, { searchQuery, ...filters }),
    [plants, searchQuery, filters],
  );

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    filters.families.length +
      filters.locations.length +
      filters.medicinalProperties.length +
      filters.tags.length +
      filters.verificationStatuses.length >
      0;

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
        await deleteCloudinaryImage(plant.imagePublicId);
      }

      const microscopicIds = (plant.microscopicImages ?? [])
        .map((img) => img.publicId)
        .filter(Boolean);
      for (const publicId of microscopicIds) {
        await deleteCloudinaryImage(publicId);
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
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10 flex flex-col gap-6 rounded-3xl border border-emerald-100/80 bg-white/90 p-8 shadow-sm backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Digital Herbarium
            </p>
            <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
              Scientific plant collection
            </h1>
            <p className="mt-3 max-w-2xl text-emerald-800/90">
              A curated academic gallery of medicinal specimens with taxonomy, pharmacological
              properties, and microscopy records.
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

        {!loading && !error && plants.length > 0 ? <HerbariumStats stats={stats} /> : null}

        <section className="mb-8 rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 shadow-sm sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Community contribution
          </p>
          <p className="mt-3 text-base leading-relaxed text-emerald-900">
            Students may submit specimens for academic review. To contribute, sign in and use{" "}
            <strong>Submit</strong>. For official collection additions, contact the KAS Team.
          </p>
        </section>

        {loading && (
          <p className="rounded-2xl border border-emerald-100 bg-white px-6 py-8 text-emerald-800">
            Loading plants…
          </p>
        )}

        {error && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-800">{error}</p>
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
          <>
            <CollapsibleSearchFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              options={filterOptions}
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={() => setFilters(EMPTY_FILTERS)}
              initialOpen={urlHasFilters}
            />
            {hasActiveFilters ? (
              <p className="-mt-4 mb-8 text-sm text-emerald-700">
                Showing {filteredPlants.length} of {plants.length} specimen
                {plants.length === 1 ? "" : "s"}
              </p>
            ) : null}
          </>
        )}

        {!loading && !error && plants.length > 0 && filteredPlants.length === 0 && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 px-8 py-12 text-center text-emerald-900">
            <p className="text-lg font-medium">No matches for your search or filters.</p>
            <p className="mt-2 text-emerald-800/90">
              Try adjusting keywords or clearing some filters.
            </p>
          </div>
        )}

        {!loading && !error && plants.length > 0 && filteredPlants.length > 0 && (
          <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredPlants.map((plant) => (
              <li key={plant.id}>
                <PlantCard
                  plant={plant}
                  isAdmin={isAdmin}
                  deletingId={deletingId}
                  onDelete={handleDelete}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
