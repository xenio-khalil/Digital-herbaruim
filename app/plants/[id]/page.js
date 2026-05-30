"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteCloudinaryImage, getCloudinaryImageUrl } from "@/lib/cloudinary";
import { useAdminSession } from "@/lib/useAdminSession";

export default function PlantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin } = useAdminSession();
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
          setPlant({ id: snap.id, ...snap.data() });
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("Could not load this plant. Check your connection and Firestore rules.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleDelete() {
    if (!plant?.id) return;

    const label = plant.plantName || "this plant";
    const ok = window.confirm(
      `Remove "${label}" from the herbarium?\n\nThis will delete the Firestore record. If Cloudinary is configured on the server, the image file will be removed too.`,
    );
    if (!ok) return;

    setDeleting(true);
    try {
      await deleteDoc(doc(db, "plants", plant.id));

      if (plant.imagePublicId) {
        await deleteCloudinaryImage(plant.imagePublicId);
      }

      router.push("/");
    } catch (e) {
      console.error(e);
      window.alert("Could not delete this plant. Check Firestore security rules and try again.");
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-900 shadow-sm transition hover:bg-emerald-50"
        >
          ← Back to Home
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
          <article className="overflow-hidden rounded-3xl border border-emerald-100/80 bg-white shadow-md">
            <div className="grid gap-0 lg:grid-cols-2 lg:items-start">
              <div className="relative aspect-[4/3] w-full self-start overflow-hidden bg-emerald-100">
                {plant.imageUrl ? (
                  <Image
                    src={getCloudinaryImageUrl(plant.imageUrl, "w_1200,c_limit,q_auto")}
                    alt={plant.plantName || "Plant specimen"}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-emerald-700">
                    No image on file
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center gap-6 p-8 sm:p-10">
                <header>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                    Specimen record
                  </p>
                  <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
                    {plant.plantName || "Untitled"}
                  </h1>
                  <p className="mt-2 text-xl italic text-emerald-800">
                    {plant.scientificName || "—"}
                  </p>
                </header>

                <dl className="grid gap-4 text-sm sm:grid-cols-2">
                  <Detail label="Family" value={plant.family} />
                  <Detail label="Location" value={plant.location} />
                  <Detail label="Collector" value={plant.collector} />
                  <Detail label="Date" value={plant.date} />
                </dl>

                <section>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                    Description
                  </h2>
                  <p className="mt-3 whitespace-pre-wrap rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-base leading-relaxed text-emerald-950">
                    {plant.description?.trim() || "No description provided."}
                  </p>
                </section>

                {isAdmin ? (
                  <section className="flex flex-wrap gap-3 pt-1">
                    <Link
                      href={`/plants/${plant.id}/edit`}
                      className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-800 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deleting ? "Deleting…" : "Delete"}
                    </button>
                  </section>
                ) : null}
              </div>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-600">{label}</dt>
      <dd className="mt-1 font-medium text-emerald-950">{value?.toString()?.trim() || "—"}</dd>
    </div>
  );
}
