"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useAdminSession } from "@/lib/useAdminSession";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAdmin, loginWithPin, logout } = useAdminSession();
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");

  const returnTo = useMemo(() => {
    const raw = searchParams.get("returnTo");
    if (!raw || !raw.startsWith("/")) return "/";
    return raw;
  }, [searchParams]);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const ok = loginWithPin(pin);
    if (!ok) {
      setError("Invalid PIN. Please contact the KAS Team for staff access.");
      return;
    }

    router.push(returnTo);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-3xl border border-emerald-100/80 bg-white/90 p-8 shadow-sm backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Digital Herbarium
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950">Staff Login</h1>
          <p className="mt-2 text-emerald-800/90">
            Enter the KAS Team PIN to unlock upload, edit, and delete controls.
          </p>
        </header>

        {!isAdmin ? (
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8"
          >
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-emerald-950">PIN</span>
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter staff PIN"
                  className="w-full rounded-2xl border border-emerald-200 bg-white py-3 pl-4 pr-14 text-emerald-950 outline-none ring-emerald-600/30 transition focus:ring-2"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  aria-label={showPin ? "Hide PIN" : "Show PIN"}
                  aria-pressed={showPin}
                  onClick={() => setShowPin((s) => !s)}
                  className="absolute inset-y-1.5 right-1.5 inline-flex items-center justify-center rounded-xl px-3 text-emerald-700 transition hover:bg-emerald-50"
                >
                  {showPin ? (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3l18 18" strokeLinecap="round" />
                      <path d="M10.6 10.6a3 3 0 004.2 4.2" strokeLinecap="round" />
                      <path
                        d="M9.36 5.56A9.8 9.8 0 0112 5c5.6 0 9.27 4.83 10 6-.28.46-.99 1.5-2.08 2.62M6.23 6.23C3.74 7.79 2.2 10.23 2 10.55c.73 1.17 4.4 6 10 6 1.6 0 3.05-.4 4.32-1.02"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path
                        d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            {error ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-2xl bg-emerald-700 py-3 text-sm font-semibold text-white shadow transition hover:bg-emerald-800"
            >
              Log in as admin
            </button>
          </form>
        ) : (
          <div className="space-y-4 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              Staff mode is active on this device.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={returnTo}
                className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100"
              >
                Continue
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-800 transition hover:bg-red-100"
              >
                End session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
