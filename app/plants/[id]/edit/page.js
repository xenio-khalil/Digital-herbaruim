"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAdminSession } from "@/lib/useAdminSession";

const empty = {
  plantName: "",
  scientificName: "",
  family: "",
  location: "",
  collector: "",
  date: "",
  description: "",
  imageUrl: "",
};

export default function EditPlantPage() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin } = useAdminSession();
  const id = typeof params?.id === "string" ? params.id : params?.id?.[0];

  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

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

        const data = snap.data();
        setForm({
          plantName: data.plantName ?? "",
          scientificName: data.scientificName ?? "",
          family: data.family ?? "",
          location: data.location ?? "",
          collector: data.collector ?? "",
          date: data.date ?? "",
          description: data.description ?? "",
          imageUrl: data.imageUrl ?? "",
        });
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

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!id || !isAdmin) return;

    setBusy(true);
    setOk("");
    setError("");
    try {
      await updateDoc(doc(db, "plants", id), {
        plantName: form.plantName.trim(),
        scientificName: form.scientificName.trim(),
        family: form.family.trim(),
        location: form.location.trim(),
        collector: form.collector.trim(),
        date: form.date,
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
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
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-3xl border border-emerald-100/80 bg-white/90 p-8 shadow-sm backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Digital Herbarium
          </p>
          <h1 className="mt-2 text-3xl font-bold text-emerald-950">Edit specimen</h1>
          <p className="mt-2 text-emerald-800/90">
            Update this specimen record and save changes to Firestore.
          </p>
          <Link
            href={id ? `/plants/${id}` : "/"}
            className="mt-4 inline-block text-sm font-semibold text-emerald-800 underline-offset-4 hover:underline"
          >
            ← Back
          </Link>
        </header>

        {!isAdmin ? (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 text-emerald-900">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Staff area
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              Staff Login is required to edit specimen records. Use the login page to enter your
              PIN.
            </p>
          </div>
        ) : null}

        {loading ? (
          <p className="rounded-3xl border border-emerald-100 bg-white px-6 py-10 text-emerald-800">
            Loading specimen…
          </p>
        ) : null}

        {!loading && error ? (
          <p className="rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-red-800">{error}</p>
        ) : null}

        {!loading && !error ? (
          <form
            onSubmit={onSubmit}
            className="space-y-5 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8"
          >
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
            <Field label="Image URL" name="imageUrl" value={form.imageUrl} onChange={onChange} />

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-emerald-950">Description</span>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                rows={4}
                required
                className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-emerald-950 outline-none ring-emerald-600/30 transition focus:ring-2"
              />
            </label>

            {ok ? (
              <p className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm text-emerald-900">{ok}</p>
            ) : null}

            <button
              type="submit"
              disabled={busy || !isAdmin}
              className="w-full rounded-2xl bg-emerald-700 py-3 text-sm font-semibold text-white shadow transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Saving changes…" : "Save changes"}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-emerald-950">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-emerald-950 outline-none ring-emerald-600/30 transition focus:ring-2"
      />
    </label>
  );
}
