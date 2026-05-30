"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { getCloudinaryImageUrl } from "@/lib/cloudinary";

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

/**
 * @param {{ imageUrl?: string, alt: string }} props
 */
export function SpecimenImageViewer({ imageUrl, alt }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const viewportRef = useRef(null);

  const displaySrc = getCloudinaryImageUrl(imageUrl, "w_1400,c_limit,q_auto");
  const fullSrc = getCloudinaryImageUrl(imageUrl, "w_2000,c_limit,q_auto");

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setZoom(1);
  }, []);

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)));
  }, []);

  useEffect(() => {
    if (!modalOpen) return;

    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [modalOpen, closeModal, zoomIn, zoomOut]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!modalOpen || !el) return;

    function onWheel(e) {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      if (e.deltaY < 0) zoomIn();
      else zoomOut();
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [modalOpen, zoomIn, zoomOut]);

  if (!imageUrl) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-emerald-200 bg-stone-50 text-emerald-700">
        No image on file
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="group relative w-full overflow-hidden rounded-3xl border border-emerald-100/80 bg-gradient-to-b from-stone-50 to-white text-left shadow-md transition hover:border-emerald-200 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        aria-label="Enlarge specimen image"
      >
        <div className="flex min-h-[220px] items-center justify-center p-3 sm:min-h-[320px] sm:p-5 lg:min-h-[420px] lg:p-6">
          <Image
            src={displaySrc}
            alt={alt}
            width={1400}
            height={1050}
            priority
            sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 65vw, 900px"
            className="h-auto max-h-[min(72vh,820px)] w-auto max-w-full object-contain transition duration-500 group-hover:scale-[1.008]"
          />
        </div>
        <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-white/95 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm backdrop-blur transition group-hover:bg-emerald-50">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Enlarge specimen
        </span>
      </button>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-emerald-950/90 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Specimen image viewer"
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
            <p className="truncate text-sm font-medium text-emerald-50">{alt}</p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={zoomOut}
                disabled={zoom <= MIN_ZOOM}
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-40"
                aria-label="Zoom out"
              >
                −
              </button>
              <span className="min-w-[3.5rem] text-center text-xs font-semibold tabular-nums text-emerald-100">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={zoomIn}
                disabled={zoom >= MAX_ZOOM}
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-40"
                aria-label="Zoom in"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="hidden rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 sm:inline-flex"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                aria-label="Close viewer"
              >
                Close
              </button>
            </div>
          </div>

          <div
            ref={viewportRef}
            className="flex flex-1 items-center justify-center overflow-auto p-4 sm:p-8"
            onClick={closeModal}
          >
            <div
              className="relative transition-transform duration-200 ease-out"
              style={{ transform: `scale(${zoom})` }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={fullSrc}
                alt={alt}
                width={2000}
                height={1500}
                sizes="100vw"
                className="h-auto max-h-[85vh] w-auto max-w-[min(100vw-2rem,1400px)] object-contain"
                priority
              />
            </div>
          </div>

          <p className="hidden border-t border-white/10 px-6 py-2 text-center text-xs text-emerald-100/80 sm:block">
            Use + / − keys or Ctrl + scroll to zoom · Esc to close
          </p>
        </div>
      ) : null}
    </>
  );
}
