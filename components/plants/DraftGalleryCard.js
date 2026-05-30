"use client";

import Image from "next/image";
import Link from "next/link";
import { getCloudinaryImageUrl } from "@/lib/cloudinary";
import { normalizeStringArray } from "@/lib/plants";
import { PlantStatusBadge } from "@/components/plants/PlantStatusBadge";
import { VerificationBadge } from "@/components/verification/VerificationBadge";
import { normalizeVerificationStatus } from "@/lib/verification";

/**
 * @param {{ plant: Record<string, unknown> }} props
 */
export function DraftGalleryCard({ plant }) {
  const tags = normalizeStringArray(plant.tags).slice(0, 3);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm ring-emerald-100 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-2">
      <Link
        href={`/plants/${plant.id}`}
        className="flex min-h-0 flex-1 flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
      >
        <div className="relative aspect-[4/3] bg-emerald-100">
          {plant.imageUrl ? (
            <Image
              src={getCloudinaryImageUrl(plant.imageUrl, "w_600,c_fill,q_auto")}
              alt={plant.plantName || "Plant"}
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-emerald-700">No image</div>
          )}
          <div className="absolute left-3 top-3">
            <PlantStatusBadge status={plant.status} />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-emerald-950">{plant.plantName || "Untitled"}</h2>
            {normalizeVerificationStatus(plant.verificationStatus) ? (
              <VerificationBadge status={plant.verificationStatus} compact />
            ) : null}
          </div>
          <p className="text-sm italic text-emerald-700">{plant.scientificName || "—"}</p>
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span key={tag} className="text-xs font-medium text-emerald-600/80">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
          <p className="mt-auto text-xs font-medium text-emerald-600">Open specimen →</p>
        </div>
      </Link>
    </article>
  );
}
