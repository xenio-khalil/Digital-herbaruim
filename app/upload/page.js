"use client";

import Link from "next/link";
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { buildPlantDocument, EMPTY_PLANT_FORM, PLANT_STATUS } from "@/lib/plants";
import { useAuth } from "@/components/AuthProvider";
import { VERIFICATION_STATUS } from "@/lib/verification";
import { DynamicStringList } from "@/components/forms/DynamicStringList";
import { Field } from "@/components/forms/Field";
import { MicroscopicImagesManager } from "@/components/forms/MicroscopicImagesManager";
import { ScientificClassificationFields } from "@/components/forms/ScientificClassificationFields";

export default function UploadPage() {
  const { isAdmin, profile } = useAuth();
  const [form, setForm] = useState({ ...EMPTY_PLANT_FORM });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

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
    setOk("");
    setErr("");

    if (!file) {
      setErr("Please choose a specimen image to upload.");
      return;
    }

    setBusy(true);
    try {
      const { secureUrl, publicId } = await uploadImageToCloudinary(file);
      const payload = buildPlantDocument({ ...form, imageUrl: secureUrl, imagePublicId: publicId });

      await addDoc(collection(db, "plants"), {
        ...payload,
        status: PLANT_STATUS.APPROVED,
        verificationStatus: VERIFICATION_STATUS.OFFICIAL,
        approvedBy: profile?.displayName || profile?.email || "Administrator",
        approvedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setForm({ ...EMPTY_PLANT_FORM });
      setFile(null);
      e.target.reset();
      setOk("Specimen saved successfully with taxonomy, properties, and microscopy data.");
    } catch (error) {
      console.error(error);
      setErr(error?.message || "Something went wrong. Check Cloudinary preset and Firestore rules.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {!isAdmin ? (
          <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 text-emerald-900">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Staff area
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              Administrator sign-in is required to publish official herbarium records directly.
            </p>
          </div>
        ) : null}

        <header className="mb-8 rounded-3xl border border-emerald-100/80 bg-white/90 p-8 shadow-sm backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Digital Herbarium
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-emerald-950">Official specimen</h1>
          <p className="mt-2 text-emerald-800/90">
            Publish directly to the public herbarium as an official collection record.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm font-semibold text-emerald-800 underline-offset-4 hover:underline"
          >
            ← Back to collection
          </Link>
        </header>

        <form
          onSubmit={onSubmit}
          className="space-y-8 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8"
        >
          <section className="space-y-5">
            <h2 className="border-b border-emerald-100 pb-2 text-sm font-semibold uppercase tracking-[0.15em] text-emerald-700">
              Core record
            </h2>
            <Field label="Plant name" name="plantName" value={form.plantName} onChange={onChange} />
            <Field
              label="Scientific name"
              name="scientificName"
              value={form.scientificName}
              onChange={onChange}
            />
            <Field label="Family" name="family" value={form.family} onChange={onChange} />
            <Field label="Location" name="location" value={form.location} onChange={onChange} />
            <Field label="Collector" name="collector" value={form.collector} onChange={onChange} />
            <Field label="Date" name="date" type="date" value={form.date} onChange={onChange} />

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-emerald-950">Description</span>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                rows={4}
                required
                className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-emerald-950 outline-none ring-emerald-600/30 transition focus:ring-2"
                placeholder="Habitat, organoleptic notes, pharmacological observations…"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-emerald-950">
                Specimen image
              </span>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(ev) => setFile(ev.target.files?.[0] ?? null)}
                className="block w-full cursor-pointer rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-900 file:mr-4 file:cursor-pointer file:rounded-xl file:border-0 file:bg-emerald-700 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-emerald-800"
              />
            </label>
          </section>

          <section>
            <ScientificClassificationFields
              classification={form.scientificClassification}
              onChange={onClassificationChange}
            />
          </section>

          <section className="space-y-5">
            <h2 className="border-b border-emerald-100 pb-2 text-sm font-semibold uppercase tracking-[0.15em] text-emerald-700">
              Pharmacology & indexing
            </h2>
            <DynamicStringList
              label="Medicinal properties"
              items={form.medicinalProperties}
              onChange={(medicinalProperties) => setForm((prev) => ({ ...prev, medicinalProperties }))}
              placeholder="e.g. Anti-inflammatory"
              addLabel="Add property"
            />
            <DynamicStringList
              label="Tags"
              items={form.tags}
              onChange={(tags) => setForm((prev) => ({ ...prev, tags }))}
              placeholder="e.g. Medicinal"
              addLabel="Add tag"
            />
          </section>

          <section>
            <MicroscopicImagesManager
              images={form.microscopicImages}
              onChange={(microscopicImages) => setForm((prev) => ({ ...prev, microscopicImages }))}
            />
          </section>

          {ok ? (
            <p className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm text-emerald-900">{ok}</p>
          ) : null}
          {err ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p> : null}

          <button
            type="submit"
            disabled={busy || !isAdmin}
            className="w-full rounded-2xl bg-emerald-700 py-3.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Uploading & saving…" : "Upload image & save record"}
          </button>
        </form>
      </div>
    </div>
  );
}
