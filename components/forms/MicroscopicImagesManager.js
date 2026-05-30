"use client";

import Image from "next/image";
import { useState } from "react";
import { uploadImageToCloudinary, getCloudinaryImageUrl } from "@/lib/cloudinary";

/**
 * @param {{ images: { url: string, publicId?: string, caption?: string }[], onChange: (images: { url: string, publicId?: string, caption?: string }[]) => void }} props
 */
export function MicroscopicImagesManager({ images, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(fileList) {
    const files = [...(fileList ?? [])].filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;

    setUploading(true);
    setError("");
    const added = [];

    try {
      for (const file of files) {
        const { secureUrl, publicId } = await uploadImageToCloudinary(file);
        added.push({ url: secureUrl, publicId, caption: "" });
      }
      onChange([...images, ...added]);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Could not upload microscopic image.");
      if (added.length > 0) onChange([...images, ...added]);
    } finally {
      setUploading(false);
    }
  }

  function updateCaption(index, caption) {
    onChange(images.map((img, i) => (i === index ? { ...img, caption } : img)));
  }

  function removeImage(index) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <fieldset className="space-y-4">
      <legend className="mb-2 block text-sm font-semibold text-emerald-950">Microscopic images</legend>

      {images.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {images.map((img, index) => (
            <li
              key={`${img.url}-${index}`}
              className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm"
            >
              <div className="relative aspect-[4/3] bg-emerald-100">
                <Image
                  src={getCloudinaryImageUrl(img.url, "w_400,c_fill,q_auto")}
                  alt={img.caption || `Microscopic image ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="space-y-2 p-3">
                <input
                  type="text"
                  value={img.caption ?? ""}
                  onChange={(e) => updateCaption(index, e.target.value)}
                  placeholder="Caption (optional)"
                  className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-950 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-600/25"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-100"
                >
                  Remove image
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-emerald-700/70">No microscopic images added yet.</p>
      )}

      <label className="block">
        <span className="sr-only">Add microscopic images</span>
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={uploading}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
          className="block w-full cursor-pointer rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/50 px-4 py-3 text-sm text-emerald-900 file:mr-4 file:cursor-pointer file:rounded-xl file:border-0 file:bg-emerald-700 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-emerald-800 disabled:opacity-60"
        />
      </label>

      {uploading ? <p className="text-sm text-emerald-700">Uploading to Cloudinary…</p> : null}
      {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
    </fieldset>
  );
}
