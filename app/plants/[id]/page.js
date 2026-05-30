"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteCloudinaryImage } from "@/lib/cloudinary";
import {
  isPublicPlant,
  normalizeMicroscopicImages,
  normalizePlant,
  normalizeStringArray,
  PLANT_STATUS,
} from "@/lib/plants";
import { useAuth } from "@/components/AuthProvider";
import { ContributionDetailsCard } from "@/components/plants/ContributionDetailsCard";
import { MedicinalPropertiesBadges } from "@/components/plants/MedicinalPropertiesBadges";
import { MicroscopicGallery } from "@/components/plants/MicroscopicGallery";
import { PlantTags } from "@/components/plants/PlantTags";
import { PlantWorkflowActions } from "@/components/plants/PlantWorkflowActions";
import { ScientificClassificationCard } from "@/components/plants/ScientificClassificationCard";
import { SpecimenImageViewer } from "@/components/plants/SpecimenImageViewer";
import { SpecimenRecordCard } from "@/components/plants/SpecimenRecordCard";

export default function PlantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAdmin, isReviewer } = useAuth();
  const id = typeof params?.id === "string" ? params.id : params?.id?.[0];
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const snap = await getDoc(doc(db, "plants", id));
        if (cancelled) return;
        if (!snap.exists()) {
          setPlant(null);
          setError("This specimen was not found.");
        } else {
          setPlant(normalizePlant({ id: snap.id, ...snap.data() }));
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("Could not load this plant. You may not have permission to view it.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!plant || loading) return;
    if (!isPublicPlant(plant) && !user && !isReviewer) {
      router.replace("/login?returnTo=/plants/" + id);
    }
  }, [plant, loading, user, isReviewer, router, id]);

  async function handleDelete() {
    if (!plant?.id) return;

    const label = plant.plantName || "this plant";
    const ok = window.confirm(`Remove "${label}" permanently?`);
    if (!ok) return;

    setDeleting(true);
    try {
      await deleteDoc(doc(db, "plants", plant.id));

      if (plant.imagePublicId) await deleteCloudinaryImage(plant.imagePublicId);
      for (const img of plant.microscopicImages ?? []) {
        if (img.publicId) await deleteCloudinaryImage(img.publicId);
      }

      router.push(plant.status === PLANT_STATUS.APPROVED ? "/" : "/my-drafts");
    } catch (e) {
      console.error(e);
      window.alert("Could not delete this record.");
      setDeleting(false);
    }
  }

  const hasClassification =
    plant &&
    (Object.values(plant.scientificClassification ?? {}).some(Boolean) || plant.family);
  const hasMedicinal = plant && normalizeStringArray(plant.medicinalProperties).length > 0;
  const hasTags = plant && normalizeStringArray(plant.tags).length > 0;
  const hasMicroscopic = plant && normalizeMicroscopicImages(plant.microscopicImages).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href={isPublicPlant(plant ?? {}) ? "/" : "/my-drafts"}
          className="mb-8 inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-900 shadow-sm transition hover:bg-emerald-50"
        >
          ← Back
        </Link>

        {loading && (
          <p className="rounded-3xl border border-emerald-100 bg-white px-6 py-10 text-emerald-800">
            Loading specimen…
          </p>
        )}

        {!loading && error && (
          <p className="rounded-3xl border border-red-200 bg-red-50 px-6 py-6 text-red-800">{error}</p>
        )}

        {!loading && plant && (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start xl:grid-cols-[minmax(0,1.15fr)_340px]">
            <article className="min-w-0 space-y-6">
              <SpecimenImageViewer
                imageUrl={plant.imageUrl}
                alt={plant.plantName || "Plant specimen"}
              />

              <div className={["grid gap-6", hasClassification ? "lg:grid-cols-2" : ""].join(" ")}>
                <section className="rounded-3xl border border-emerald-100/80 bg-white p-6 shadow-sm sm:p-7">
                  <header className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                      Notes
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-emerald-950">Description</h2>
                  </header>
                  <p className="whitespace-pre-wrap text-base leading-relaxed text-emerald-950">
                    {plant.description?.trim() || "No description provided."}
                  </p>
                </section>

                {hasClassification ? (
                  <ScientificClassificationCard
                    classification={plant.scientificClassification}
                    fallbackFamily={plant.family}
                    compact
                  />
                ) : null}
              </div>

              {hasMedicinal ? (
                <section className="rounded-3xl border border-emerald-100/80 bg-white p-6 shadow-sm sm:p-7">
                  <MedicinalPropertiesBadges properties={plant.medicinalProperties} />
                </section>
              ) : null}

              {hasTags ? (
                <section className="rounded-3xl border border-emerald-100/80 bg-white p-6 shadow-sm sm:p-7">
                  <PlantTags tags={plant.tags} />
                </section>
              ) : null}

              {hasMicroscopic ? (
                <section className="rounded-3xl border border-emerald-100/80 bg-white p-6 shadow-sm sm:p-7">
                  <MicroscopicGallery images={plant.microscopicImages} />
                </section>
              ) : null}

              <div className="lg:hidden">
                <ContributionDetailsCard plant={plant} />
              </div>
            </article>

            <aside className="space-y-6 lg:sticky lg:top-24">
              <SpecimenRecordCard plant={plant} />
              <div className="hidden lg:block">
                <ContributionDetailsCard plant={plant} />
              </div>
              <PlantWorkflowActions
                plant={plant}
                userId={user?.uid}
                isAdmin={isAdmin}
                isReviewer={isReviewer}
                deleting={deleting}
                onDelete={handleDelete}
              />
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
