"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PlantLogo } from "@/components/PlantLogo";
import { UserMenu } from "@/components/auth/UserMenu";
import { useAuth } from "@/components/AuthProvider";

const LINKS = [
  { href: "/", label: "Home", match: (p) => p === "/" || p.startsWith("/plants/") },
  { href: "/about", label: "About", match: (p) => p === "/about" || p.startsWith("/about/") },
];

function linkClass(active) {
  return [
    "rounded-xl px-4 py-3 text-center text-sm font-semibold tracking-wide transition md:inline-block md:px-3 md:py-2 md:text-left",
    active
      ? "bg-emerald-100 text-emerald-950 ring-1 ring-emerald-200/80"
      : "text-emerald-800 hover:bg-emerald-50/90 hover:text-emerald-950",
  ].join(" ");
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isSignedIn, isAdmin, isReviewer } = useAuth();

  const navigationLinks = [
    ...LINKS,
    ...(isSignedIn
      ? [
          { href: "/my-drafts", label: "My drafts", match: (p) => p.startsWith("/my-drafts") || p === "/submit" },
          { href: "/submit", label: "Submit", match: (p) => p === "/submit" },
        ]
      : []),
    ...(isAdmin
      ? [
          { href: "/upload", label: "Official upload", match: (p) => p === "/upload" || p.startsWith("/upload/") },
          { href: "/admin/users", label: "Users", match: (p) => p.startsWith("/admin/") },
        ]
      : []),
    ...(isReviewer
      ? [{ href: "/review", label: "Review", match: (p) => p.startsWith("/review") }]
      : []),
  ];

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 rounded-xl outline-none ring-emerald-600/40 transition hover:bg-emerald-50/80 focus-visible:ring-2"
        >
          <PlantLogo className="h-9 w-9 shrink-0 text-emerald-700" />
          <span className="truncate text-base font-bold tracking-tight text-emerald-950 sm:text-lg">
            Digital Herbarium
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden md:block">
            <UserMenu />
          </div>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-200/80 bg-white text-emerald-900 shadow-sm transition hover:bg-emerald-50 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="site-mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            )}
          </button>

          <nav
            className="font-serif hidden items-center gap-1 md:flex"
            aria-label="Main navigation"
          >
            {navigationLinks.map(({ href, label, match }) => (
              <Link key={href} href={href} className={linkClass(match(pathname))}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <nav
        id="site-mobile-nav"
        className={[
          "font-serif mt-3 flex-col gap-1 border-t border-emerald-100 pt-3 md:hidden",
          menuOpen ? "flex" : "hidden",
        ].join(" ")}
        aria-hidden={!menuOpen}
      >
        {navigationLinks.map(({ href, label, match }) => (
          <Link key={href} href={href} onClick={close} className={linkClass(match(pathname))}>
            {label}
          </Link>
        ))}
        <div className="mt-2 border-t border-emerald-100 pt-2 md:hidden">
          <UserMenu />
        </div>
      </nav>
    </div>
  );
}
