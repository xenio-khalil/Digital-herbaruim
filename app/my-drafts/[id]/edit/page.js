"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EditDraftRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : params?.id?.[0];

  useEffect(() => {
    if (id) router.replace(`/plants/${id}/edit`);
    else router.replace("/my-drafts");
  }, [id, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white px-4 py-16 text-emerald-800">
      Redirecting…
    </div>
  );
}
