"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getCloudinaryImageUrl } from "@/lib/cloudinary";
import { normalizeMicroscopicImages } from "@/lib/plants";

/**
 * @param {{ images: unknown }} props
 */
export function MicroscopicGallery({ images }) {
  const items = normalizeMicroscopicImages(images);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") setActiveIndex(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [activeIndex]);

  if (items.length === 0) return null;

  const active = activeIndex !== null ? items[activeIndex] : null;

  return (
    <section>
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
          Microscopy
        </p>
        <h2 className="mt-1 text-xl font-bold text-emerald-950">Microscopic gallery</h2>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((img, index) => (
          <li key={`${img.url}-${index}`}>
            <button
              type="button"
              onClick={() => setActiveIndex(index)}
              className="group relative w-full overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <div className="relative aspect-square">
                <Image
                  src={getCloudinaryImageUrl(img.url, "w_400,c_fill,q_auto")}
                  alt={img.caption || `Microscopic view ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-emerald-950/0 transition group-hover:bg-emerald-950/20">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-900 opacity-0 shadow transition group-hover:opacity-100">
                    View
                  </span>
                </span>
              </div>
              {img.caption ? (
                <p className="px-3 py-2 text-left text-xs font-medium text-emerald-800">{img.caption}</p>
              ) : null}
            </button>
          </li>
        ))}
      </ul>

      {active ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Microscopic image preview"
          onClick={() => setActiveIndex(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-emerald-100/20 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/3] max-h-[75vh] w-full bg-emerald-100">
              <Image
                src={getCloudinaryImageUrl(active.url, "w_1400,c_limit,q_auto")}
                alt={active.caption || "Microscopic image"}
                fill
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-contain"
                priority
              />
            </div>
            {active.caption ? (
              <p className="border-t border-emerald-100 px-6 py-4 text-sm text-emerald-800">
                {active.caption}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => setActiveIndex(null)}
              className="absolute right-3 top-3 rounded-full bg-white/95 p-2 text-emerald-900 shadow transition hover:bg-white"
              aria-label="Close preview"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
