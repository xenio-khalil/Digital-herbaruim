"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export function UserMenu() {
  const { isSignedIn, profile, loading, signIn, signOut } = useAuth();

  if (loading) {
    return (
      <div className="h-9 w-24 animate-pulse rounded-xl bg-emerald-100/80" aria-hidden />
    );
  }

  if (!isSignedIn) {
    return (
      <Link
        href="/login"
        className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-900 shadow-sm transition hover:bg-emerald-50"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {profile?.photoURL ? (
        <Image
          src={profile.photoURL}
          alt=""
          width={36}
          height={36}
          className="h-9 w-9 rounded-full border border-emerald-200 object-cover"
          unoptimized
        />
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
          {(profile?.displayName || profile?.email || "?").charAt(0).toUpperCase()}
        </span>
      )}
      <div className="hidden min-w-0 sm:block">
        <p className="truncate text-sm font-semibold text-emerald-950">
          {profile?.displayName || "User"}
        </p>
        <p className="truncate text-xs capitalize text-emerald-600">{profile?.role || "student"}</p>
      </div>
      <button
        type="button"
        onClick={() => signOut()}
        className="rounded-xl border border-emerald-200 px-2.5 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-50"
      >
        Sign out
      </button>
    </div>
  );
}
