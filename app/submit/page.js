"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { useAuth } from "@/components/AuthProvider";
import {
  buildStudentPlantDocument,
  EMPTY_PLANT_FORM,
  PLANT_STATUS,
} from "@/lib/plants";
import { SubmissionForm } from "@/components/submissions/SubmissionForm";

export default function SubmitPage() {
  const router = useRouter();
  const { isSignedIn, user, profile, loading: authLoading } = useAuth();
  const [form, setForm] = useState({ ...EMPTY_PLANT_FORM });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!authLoading && !isSignedIn) {
      router.replace("/login?returnTo=/submit");
    }
  }, [authLoading, isSignedIn, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white px-4 py-16 text-emerald-800">
        Loading…
      </div>
    );
  }

  if (!isSignedIn) return null;

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

  async function saveDraft(e) {
    e.preventDefault();
    if (!user) return;
    setErr("");
    setBusy(true);

    try {
      let imageUrl = form.imageUrl;
      let imagePublicId = form.imagePublicId;

      if (file) {
        const uploaded = await uploadImageToCloudinary(file);
        imageUrl = uploaded.secureUrl;
        imagePublicId = uploaded.publicId;
      }

      if (!imageUrl) {
        setErr("Please upload a specimen image.");
        setBusy(false);
        return;
      }

      const author = {
        uid: user.uid,
        name: profile?.displayName || user.displayName || "",
        email: profile?.email || user.email || "",
      };

      const payload = buildStudentPlantDocument(
        { ...form, imageUrl, imagePublicId },
        author,
        PLANT_STATUS.DRAFT,
      );

      await addDoc(collection(db, "plants"), {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.push("/my-drafts");
    } catch (error) {
      console.error(error);
      setErr(error?.message || "Could not save draft.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-3xl border border-emerald-100/80 bg-white/90 p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Student contribution
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-emerald-950">Submit specimen</h1>
          <p className="mt-2 text-emerald-800/90">
            Saved as a draft in the plants collection. Submit for review when ready.
          </p>
          <Link href="/my-drafts" className="mt-4 inline-block text-sm font-semibold text-emerald-800 hover:underline">
            ← My drafts
          </Link>
        </header>

        <form
          onSubmit={saveDraft}
          className="space-y-6 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8"
        >
          <SubmissionForm
            form={form}
            onChange={onChange}
            onClassificationChange={onClassificationChange}
            onFormPatch={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
            file={file}
            onFileChange={setFile}
          />

          {err ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p> : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-emerald-700 py-3.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-800 disabled:opacity-60"
          >
            {busy ? "Saving draft…" : "Save as draft"}
          </button>
        </form>
      </div>
    </div>
  );
}
