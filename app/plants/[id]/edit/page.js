"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import {
  buildPlantDocument,
  buildStudentPlantDocument,
  EMPTY_PLANT_FORM,
  isPlantOwner,
  normalizePlant,
  PLANT_STATUS,
  plantToFormState,
} from "@/lib/plants";
import { useAuth } from "@/components/AuthProvider";
import { SubmissionForm } from "@/components/submissions/SubmissionForm";
import { PlantStatusBadge } from "@/components/plants/PlantStatusBadge";

export default function EditPlantPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile, isAdmin, loading: authLoading } = useAuth();
  const id = typeof params?.id === "string" ? params.id : params?.id?.[0];

  const [plant, setPlant] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_PLANT_FORM });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const isOwner = plant ? isPlantOwner(plant, user?.uid) : false;
  const canEdit =
    isAdmin ||
    (isOwner && [PLANT_STATUS.DRAFT, PLANT_STATUS.REJECTED].includes(plant?.status));

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadPlant() {
      setLoading(true);
      setError("");
      try {
        const snap = await getDoc(doc(db, "plants", id));
        if (cancelled) return;
        if (!snap.exists()) {
          setError("This specimen was not found.");
          setLoading(false);
          return;
        }

        const data = normalizePlant({ id: snap.id, ...snap.data() });
        setPlant(data);
        setForm(plantToFormState(data));
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("Could not load this plant for editing.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPlant();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (loading || authLoading || !plant) return;

    if (!user) {
      router.replace(`/login?returnTo=/plants/${id}/edit`);
      return;
    }

    if (!canEdit) {
      setError("You do not have permission to edit this record.");
    }
  }, [loading, authLoading, plant, user, canEdit, router, id]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function onClassificationChange(key, value) {
    setForm((prev) => ({
      ...prev,
      scientificClassification: { ...prev.scientificClassification, [key]: value },
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!id || !canEdit || !user) return;

    setBusy(true);
    setOk("");
    setError("");

    try {
      let imageUrl = form.imageUrl;
      let imagePublicId = form.imagePublicId;

      if (file) {
        const uploaded = await uploadImageToCloudinary(file);
        imageUrl = uploaded.secureUrl;
        imagePublicId = uploaded.publicId;
      }

      if (!imageUrl) {
        setError("A specimen image is required.");
        setBusy(false);
        return;
      }

      const formWithImage = { ...form, imageUrl, imagePublicId };

      let payload;
      if (isAdmin && !isOwner) {
        payload = buildPlantDocument(formWithImage);
      } else {
        const author = {
          uid: user.uid,
          name: profile?.displayName || user.displayName || "",
          email: profile?.email || user.email || "",
        };
        payload = buildStudentPlantDocument(formWithImage, author, plant.status);
      }

      await updateDoc(doc(db, "plants", id), {
        ...payload,
        updatedAt: serverTimestamp(),
      });

      setOk("Specimen updated successfully.");
      router.push(`/plants/${id}`);
    } catch (e) {
      console.error(e);
      setError("Could not save changes. Check Firestore rules and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-3xl border border-emerald-100/80 bg-white/90 p-8 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <p className="w-full text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Digital Herbarium
            </p>
            <h1 className="font-serif text-3xl font-bold text-emerald-950">Edit specimen</h1>
            {plant?.status ? <PlantStatusBadge status={plant.status} /> : null}
          </div>
          <p className="mt-2 text-emerald-800/90">
            Update taxonomy, pharmacological properties, tags, and microscopy records.
          </p>
          {plant?.reviewerNotes && plant.status === PLANT_STATUS.REJECTED ? (
            <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
              Reviewer feedback: {plant.reviewerNotes}
            </p>
          ) : null}
          <Link
            href={id ? `/plants/${id}` : "/"}
            className="mt-4 inline-block text-sm font-semibold text-emerald-800 underline-offset-4 hover:underline"
          >
            ← Back to specimen
          </Link>
        </header>

        {loading ? (
          <p className="rounded-3xl border border-emerald-100 bg-white px-6 py-10 text-emerald-800">
            Loading specimen…
          </p>
        ) : null}

        {!loading && error ? (
          <p className="rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-red-800">{error}</p>
        ) : null}

        {!loading && !error && canEdit ? (
          <form
            onSubmit={onSubmit}
            className="space-y-6 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8"
          >
            <SubmissionForm
              form={form}
              onChange={onChange}
              onClassificationChange={onClassificationChange}
              onFormPatch={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
              file={file}
              onFileChange={setFile}
              requireImage={!form.imageUrl}
              showImageUrl={isAdmin}
            />

            {ok ? (
              <p className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm text-emerald-900">{ok}</p>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-2xl bg-emerald-700 py-3.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Saving changes…" : "Save changes"}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
