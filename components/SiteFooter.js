"use client";

import Link from "next/link";
import { useAdminSession } from "@/lib/useAdminSession";

export function SiteFooter() {
  const { isAdmin, logout } = useAdminSession();

  function handleLogout(e) {
    e.preventDefault();
    logout();
  }

  return (
    <footer className="border-t border-emerald-100/80 bg-white/90 py-4 text-center text-xs text-emerald-800/90">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-2 px-4 sm:px-6 lg:px-8">
        <span>
          Made by <span className="font-semibold text-emerald-900">MR.xeniokhalil</span>
        </span>
        <span className="text-emerald-400">•</span>
        {!isAdmin ? (
          <Link
            href="/login"
            className="font-medium text-emerald-700 underline-offset-4 transition hover:text-emerald-900 hover:underline"
          >
            Staff Login
          </Link>
        ) : (
          <>
            <span className="font-medium text-emerald-700">Staff mode active</span>
            <a
              href="#staff-logout"
              onClick={handleLogout}
              className="font-medium text-emerald-700 underline-offset-4 transition hover:text-emerald-900 hover:underline"
            >
              End session
            </a>
          </>
        )}
      </div>
    </footer>
  );
}
