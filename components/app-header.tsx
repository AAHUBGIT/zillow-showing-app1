"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { InlineSpinner } from "@/components/inline-spinner";
import { LoadingLink } from "@/components/loading-link";
import { logoutUser } from "@/lib/actions";
import { SessionUser } from "@/lib/auth";
import type { WorkflowDefaultDensity } from "@/lib/workflow-settings";

type WorkflowDensity = WorkflowDefaultDensity;

const navItems = [
  { href: "/today", label: "Today", description: "Daily work queue" },
  { href: "/", label: "Dashboard", description: "Lead pipeline" },
  { href: "/leads/new", label: "New Lead", description: "Create customer" },
  { href: "/properties", label: "Properties", description: "Inventory pool" },
  { href: "/routes", label: "Routes", description: "Showing route days" }
];

const workflowDensityStorageKey = "showings-crm:workflow-density";

export function AppHeader({
  isPreviewReadonly = false,
  sessionUser,
  defaultDensity = "compact"
}: {
  isPreviewReadonly?: boolean;
  sessionUser: SessionUser | null;
  defaultDensity?: WorkflowDensity;
}) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [workflowDensity, setWorkflowDensity] = useState<WorkflowDensity>(defaultDensity);
  const isLoginPage = pathname === "/login";
  const showWorkspaceHero = false;

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

  useEffect(() => {
    const storedDensity = window.localStorage.getItem(workflowDensityStorageKey);

    if (storedDensity === "comfortable" || storedDensity === "compact") {
      setWorkflowDensity(storedDensity);
    } else {
      setWorkflowDensity(defaultDensity);
    }
  }, [defaultDensity]);

  useEffect(() => {
    document.documentElement.dataset.workflowDensity = workflowDensity;
    window.localStorage.setItem(workflowDensityStorageKey, workflowDensity);
  }, [workflowDensity]);

  return (
    <>
      {sessionUser ? (
        <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-line/80 bg-white/95 px-4 py-5 shadow-[18px_0_45px_-34px_rgba(15,23,42,0.45)] backdrop-blur lg:flex">
          <div className="flex items-center gap-3 rounded-3xl border border-line/80 bg-slate-50/90 p-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb,#0f172a)] text-sm font-semibold text-white shadow-soft">
              SC
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                Showings CRM
              </p>
              <p className="truncate text-xs font-medium text-slate-500">
                Showing workflow
              </p>
            </div>
          </div>

          {isPreviewReadonly ? (
            <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
              Preview workspace: changes are limited
            </div>
          ) : null}

          <nav className="mt-5 space-y-1.5" aria-label="Primary navigation">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Workspace
            </p>
            {navItems.map((item) => {
              const active = isActive(item.href);

              return (
                <div key={item.href}>
                  <LoadingLink
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition ${
                      active
                        ? "bg-[linear-gradient(135deg,#0f172a,#2563eb)] text-white shadow-soft"
                        : "text-slate-700 hover:bg-accentSoft hover:text-accent"
                    }`}
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="text-sm font-semibold">{item.label}</span>
                      <span
                        className={`truncate text-xs ${
                          active ? "text-blue-100" : "text-slate-500"
                        }`}
                      >
                        {item.description}
                      </span>
                    </span>
                  </LoadingLink>

                  {item.href === "/properties" ? (
                    <div className="ml-3 mt-1 grid gap-1 border-l border-line/80 pl-3">
                      <LoadingLink
                        href="/properties"
                        className="flex w-full min-h-[34px] items-center rounded-xl px-3 py-1.5 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-accent"
                      >
                        Properties
                      </LoadingLink>
                      <LoadingLink
                        href="/properties#add-property-listing"
                        className="flex w-full min-h-[34px] items-center rounded-xl px-3 py-1.5 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-accent"
                      >
                        Add a property
                      </LoadingLink>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>

          <div className="mt-6 rounded-3xl border border-line/80 bg-slate-50/90 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accentSoft text-xs font-semibold text-accent">
                {sessionUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Signed in
                </p>
                <p className="truncate text-sm font-semibold text-slate-700">{sessionUser.email}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-line/80 bg-white p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Density
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2" aria-label="Workflow density">
              <button
                type="button"
                onClick={() => setWorkflowDensity("compact")}
                aria-pressed={workflowDensity === "compact"}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                  workflowDensity === "compact"
                    ? "bg-accent text-white"
                    : "border border-line bg-white text-slate-600 hover:text-accent"
                }`}
              >
                Compact
              </button>
              <button
                type="button"
                onClick={() => setWorkflowDensity("comfortable")}
                aria-pressed={workflowDensity === "comfortable"}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                  workflowDensity === "comfortable"
                    ? "bg-accent text-white"
                    : "border border-line bg-white text-slate-600 hover:text-accent"
                }`}
              >
                Comfort
              </button>
            </div>
          </div>

          <div className="mt-auto space-y-2 border-t border-line/80 pt-4">
            <LoadingLink
              href="/settings"
              aria-current={isActive("/settings") ? "page" : undefined}
              className={`flex w-full items-center rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                isActive("/settings")
                  ? "bg-accentSoft text-accent"
                  : "text-slate-600 hover:bg-accentSoft hover:text-accent"
              }`}
            >
              Settings
            </LoadingLink>
            <LoadingLink href="/leads/new" className="app-button-primary w-full px-4 py-2.5">
              Add Lead
            </LoadingLink>
            <form action={logoutUser}>
              <LogoutButton className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-accent hover:text-accent" />
            </form>
          </div>
        </aside>
      ) : null}

      <div
        className={`sticky top-0 z-50 -mx-4 border-b backdrop-blur transition sm:-mx-6 lg:-mx-8 ${
          sessionUser ? "lg:hidden " : ""
        }${
          isScrolled
            ? "border-slate-200/80 bg-white/92 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.34)]"
            : "border-transparent bg-white/60"
        }`}
      >
        <div
          className={`mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 transition-all sm:px-6 lg:px-8 ${
            isScrolled ? "py-2" : "py-3"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb,#0f172a)] text-sm font-semibold text-white shadow-soft">
              SC
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                Showings CRM
              </p>
              <p className="text-sm font-medium text-slate-500">Leads, showings, routes, follow-ups</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <nav className="flex flex-wrap gap-2" aria-label="Primary navigation">
              {navItems.map((item) => (
                <LoadingLink
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
                </LoadingLink>
              ))}
              {sessionUser ? (
                <LoadingLink
                  href="/settings"
                  aria-current={isActive("/settings") ? "page" : undefined}
                  className={`rounded-full px-4 py-2 text-sm font-medium shadow-sm transition ${
                    isActive("/settings")
                      ? "border border-transparent bg-[linear-gradient(135deg,#0f172a,#2563eb)] text-white"
                      : "border border-slate-200/90 bg-white/95 text-slate-700 hover:border-accent hover:text-accent"
                  }`}
                >
                  Settings
                </LoadingLink>
              ) : null}
            </nav>

            {sessionUser ? (
              <div
                className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm"
                aria-label="Workflow density"
              >
                <button
                  type="button"
                  onClick={() => setWorkflowDensity("compact")}
                  aria-pressed={workflowDensity === "compact"}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    workflowDensity === "compact"
                      ? "bg-accent text-white"
                      : "text-slate-500 hover:text-accent"
                  }`}
                >
                  Compact
                </button>
                <button
                  type="button"
                  onClick={() => setWorkflowDensity("comfortable")}
                  aria-pressed={workflowDensity === "comfortable"}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    workflowDensity === "comfortable"
                      ? "bg-accent text-white"
                      : "text-slate-500 hover:text-accent"
                  }`}
                >
                  Comfort
                </button>
              </div>
            ) : null}

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
                <LoadingLink href="/leads/new" className="app-button-primary px-4 py-2.5">
                  Add Lead
                </LoadingLink>
                <form action={logoutUser}>
                  <LogoutButton />
                </form>
              </>
            ) : isLoginPage ? (
              <a
                href="#login-form"
                className="app-button-primary px-4 py-2.5"
              >
                Go To Sign In
              </a>
            ) : (
              <LoadingLink href="/login" className="app-button-primary px-4 py-2.5">
                Login
              </LoadingLink>
            )}
          </div>
        </div>
      </div>

      {showWorkspaceHero ? (
        <div className="app-panel mb-6 mt-4 overflow-hidden">
          <div className="relative isolate px-5 py-6 sm:px-8 sm:py-8">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.26),transparent_24%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.94))]" />
            <div className="absolute right-8 top-0 -z-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-4 left-1/3 -z-10 h-32 w-32 rounded-full bg-blue-300/20 blur-3xl" />

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-3xl">
                  <div className="app-chip border-white/10 bg-white/10 text-blue-50">
                    Showings CRM
                  </div>
                  {isPreviewReadonly ? (
                    <div className="mt-3 inline-flex rounded-full border border-amber-200/40 bg-amber-300/15 px-3 py-1.5 text-xs font-semibold text-amber-100">
                      Preview workspace: changes are limited
                    </div>
                  ) : null}
                  <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl xl:text-[2.8rem]">
                    Run your rental showing day from one workspace.
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
                    Keep leads, properties, showings, routes, and follow-ups organized in one focused
                    workspace built for agents in the field.
                  </p>
                </div>
                <div className="rounded-4xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                        Daily Workspace
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">Today Command Center</p>
                      <p className="mt-2 text-sm leading-6 text-slate-200">
                        Built to prioritize showings, follow-ups, routes, and the next lead that
                        needs attention.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
                      <LoadingLink
                        href="/today"
                        className="app-button-primary bg-white px-6 text-ink hover:bg-slate-100"
                      >
                        Open Today
                      </LoadingLink>
                      <LoadingLink
                        href="/leads/new"
                        className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                      >
                        Add New Lead
                      </LoadingLink>
                      <LoadingLink
                        href="/routes"
                        className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                      >
                        View Daily Routes
                      </LoadingLink>
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
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Access</p>
                  <p className="mt-1 text-sm font-semibold text-white">Workspace ready</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function LogoutButton({ className = "app-button-secondary" }: { className?: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {pending ? (
        <>
          <InlineSpinner />
          <span>Logging Out...</span>
        </>
      ) : (
        "Logout"
      )}
    </button>
  );
}
