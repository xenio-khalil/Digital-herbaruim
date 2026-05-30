"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";
  const { isSignedIn, signIn, authError, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isSignedIn) {
      const safe = returnTo.startsWith("/") ? returnTo : "/";
      router.replace(safe);
    }
  }, [isSignedIn, returnTo, router]);

  async function handleGoogleSignIn() {
    setBusy(true);
    setError("");
    const ok = await signIn();
    if (!ok) setError(authError || "Sign in failed.");
    setBusy(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="mx-auto flex max-w-lg flex-col justify-center px-4 py-16 sm:px-6">
        <header className="mb-8 rounded-3xl border border-emerald-100/80 bg-white/90 p-8 shadow-sm backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Digital Herbarium
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-emerald-950">Sign in</h1>
          <p className="mt-3 text-emerald-800/90">
            Use your Google account to contribute specimens, manage drafts, and participate in the
            academic review workflow.
          </p>
        </header>

        <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
          <button
            type="button"
            disabled={busy || loading}
            onClick={handleGoogleSignIn}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3.5 text-sm font-semibold text-emerald-950 shadow-sm transition hover:bg-emerald-50 disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {busy ? "Signing in…" : "Continue with Google"}
          </button>

          {(error || authError) && !busy ? (
            <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">
              {error || authError}
            </p>
          ) : null}

          <p className="mt-6 text-center text-sm text-emerald-700">
            <Link href="/" className="font-semibold underline-offset-4 hover:underline">
              ← Back to collection
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-emerald-700/80">
          New accounts receive the <strong>student</strong> role by default. Administrators assign
          professor or admin roles in Firestore.
        </p>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white px-4 py-16 text-emerald-800">
      Loading…
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}
