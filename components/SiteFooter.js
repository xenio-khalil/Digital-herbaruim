"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export function SiteFooter() {
  const { isSignedIn, isAdmin, profile, signOut } = useAuth();

  return (
    <footer className="border-t border-emerald-100/80 bg-white/90 py-4 text-center text-xs text-emerald-800/90">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-2 px-4 sm:px-6 lg:px-8">
        <span>
          Made by <span className="font-semibold text-emerald-900">MR.xeniokhalil</span>
        </span>
        <span className="text-emerald-400">•</span>
        <span className="font-medium text-emerald-700">KAS Digital Herbarium</span>
        {!isSignedIn ? (
          <>
            <span className="text-emerald-400">•</span>
            <Link
              href="/login"
              className="font-medium text-emerald-700 underline-offset-4 transition hover:text-emerald-900 hover:underline"
            >
              Sign in with Google
            </Link>
          </>
        ) : (
          <>
            <span className="text-emerald-400">•</span>
            <span className="font-medium capitalize text-emerald-700">
              {profile?.displayName || profile?.email} ({profile?.role || "student"})
            </span>
            <button
              type="button"
              onClick={() => signOut()}
              className="font-medium text-emerald-700 underline-offset-4 transition hover:text-emerald-900 hover:underline"
            >
              Sign out
            </button>
          </>
        )}
        {isAdmin ? (
          <>
            <span className="text-emerald-400">•</span>
            <Link href="/upload" className="font-medium text-emerald-700 hover:underline">
              Official upload
            </Link>
          </>
        ) : null}
      </div>
    </footer>
  );
}
