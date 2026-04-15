"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutUser } from "@/lib/actions";
import { SessionUser } from "@/lib/auth";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/leads/new", label: "New Lead" },
  { href: "/routes", label: "Routes" }
];

export function AppHeader({
  isPreviewReadonly = false,
  sessionUser
}: {
  isPreviewReadonly?: boolean;
  sessionUser: SessionUser | null;
}) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div
        className={`sticky top-0 z-50 -mx-4 border-b backdrop-blur transition sm:-mx-6 lg:-mx-8 ${
          isScrolled
            ? "border-slate-200/80 bg-white/92 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.34)]"
            : "border-transparent bg-white/60"
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb,#0f172a)] text-sm font-semibold text-white shadow-soft">
              RS
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                Rental Showing Agent CRM
              </p>
              <p className="text-sm font-medium text-slate-500">Leads, showings, and routes</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <nav className="flex flex-wrap gap-2" aria-label="Primary navigation">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`rounded-full px-4 py-2 text-sm font-medium shadow-sm transition ${
                    isActive(item.href)
                      ? "border border-transparent bg-[linear-gradient(135deg,#0f172a,#2563eb)] text-white"
                      : "border border-slate-200/90 bg-white/95 text-slate-700 hover:border-accent hover:text-accent"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {sessionUser ? (
              <>
                <div className="hidden items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm sm:inline-flex">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accentSoft text-xs font-semibold text-accent">
                    {sessionUser.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Signed in
                    </span>
                    <span className="text-sm font-medium text-slate-600">{sessionUser.email}</span>
                  </div>
                </div>
                <Link href="/leads/new" className="app-button-primary px-4 py-2.5">
                  Add Lead
                </Link>
                <form action={logoutUser}>
                  <button type="submit" className="app-button-secondary">
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <Link href="/login" className="app-button-primary px-4 py-2.5">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="app-panel mb-6 mt-4 overflow-hidden">
        <div className="relative isolate px-5 py-6 sm:px-8 sm:py-8">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.26),transparent_24%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.94))]" />
          <div className="absolute right-8 top-0 -z-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-4 left-1/3 -z-10 h-32 w-32 rounded-full bg-blue-300/20 blur-3xl" />

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <div className="app-chip border-white/10 bg-white/10 text-blue-50">
                  Modern real estate workflow
                </div>
                {isPreviewReadonly ? (
                  <div className="mt-3 inline-flex rounded-full border border-amber-200/40 bg-amber-300/15 px-3 py-1.5 text-xs font-semibold text-amber-100">
                    Public preview mode: demo data, read-only changes
                  </div>
                ) : null}
                <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl xl:text-[2.8rem]">
                  Run your showing pipeline like a polished modern CRM.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
                  Keep lead follow-up, scheduling, route planning, and calendar-ready showing
                  details in one focused workspace built for speed.
                </p>
              </div>
              <div className="rounded-4xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                      Workspace
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">Agent Ops Command Center</p>
                    <p className="mt-2 text-sm leading-6 text-slate-200">
                      Built to prioritize follow-ups, schedule tours, and move prospects toward a
                      signed showing.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
                    <Link
                      href="/leads/new"
                      className="app-button-primary bg-white px-6 text-ink hover:bg-slate-100"
                    >
                      Add New Lead
                    </Link>
                    <Link
                      href="/routes"
                      className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                    >
                      View Daily Routes
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Workflow</p>
                <p className="mt-1 text-sm font-semibold text-white">Leads to close</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Mobile</p>
                <p className="mt-1 text-sm font-semibold text-white">Easy on the go</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Routes</p>
                <p className="mt-1 text-sm font-semibold text-white">Grouped by day</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Storage</p>
                <p className="mt-1 text-sm font-semibold text-white">Preview safe</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
