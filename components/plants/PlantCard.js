"use client";

import Image from "next/image";
import Link from "next/link";
import { getCloudinaryImageUrl } from "@/lib/cloudinary";
import { normalizeStringArray } from "@/lib/plants";
import { VerificationBadge } from "@/components/verification/VerificationBadge";
import { normalizeVerificationStatus } from "@/lib/verification";

/**
 * @param {{ plant: Record<string, unknown>, isAdmin?: boolean, deletingId?: string | null, onDelete?: (plant: Record<string, unknown>) => void }} props
 */
export function PlantCard({ plant, isAdmin, deletingId, onDelete }) {
  const tags = normalizeStringArray(plant.tags).slice(0, 3);
  const properties = normalizeStringArray(plant.medicinalProperties).slice(0, 2);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm ring-emerald-100 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-2">
      <Link
        href={`/plants/${plant.id}`}
        className="flex min-h-0 flex-1 flex-col rounded-t-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[4/3] bg-emerald-100">
          {plant.imageUrl ? (
            <Image
              src={getCloudinaryImageUrl(plant.imageUrl, "w_600,c_fill,q_auto")}
              alt={plant.plantName || "Plant"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-emerald-700">No image</div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-emerald-950">{plant.plantName || "Untitled"}</h2>
            {normalizeVerificationStatus(plant.verificationStatus) ? (
              <VerificationBadge status={plant.verificationStatus} compact />
            ) : null}
          </div>
          <p className="text-sm italic text-emerald-700">
            {plant.scientificName || "Scientific name not set"}
          </p>
          {plant.family ? (
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
              {plant.family}
            </p>
          ) : null}
          {properties.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {properties.map((prop) => (
                <span
                  key={prop}
                  className="rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700"
                >
                  {prop}
                </span>
              ))}
            </div>
          ) : null}
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span key={tag} className="text-xs font-medium text-emerald-600/80">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
          {plant.location ? (
            <p className="mt-auto text-xs text-emerald-600/90">{plant.location}</p>
          ) : null}
          <p className="text-xs font-medium text-emerald-600">View specimen record →</p>
        </div>
      </Link>
      {isAdmin ? (
        <div className="grid grid-cols-2 gap-3 border-t border-emerald-100 px-5 py-4">
          <Link
            href={`/plants/${plant.id}/edit`}
            className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-center text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100"
          >
            Edit
          </Link>
          <button
            type="button"
            disabled={deletingId === plant.id}
            onClick={() => onDelete?.(plant)}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-800 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deletingId === plant.id ? "Deleting…" : "Delete"}
          </button>
        </div>
      ) : null}
    </article>
  );
}
