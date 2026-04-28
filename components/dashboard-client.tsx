"use client";

import { useMemo, useRef, useState } from "react";
import { DateInputField } from "@/components/date-input-field";
import { LeadCard } from "@/components/lead-card";
import { LoadingLink } from "@/components/loading-link";
import { PreviewModeBanner } from "@/components/preview-mode-banner";
import {
  followUpFilterOptions,
  getFollowUpStateLabel,
  getFollowUpState,
  getPriorityLabel,
  getSourceLabel,
  getStatusLabel,
  getUpcomingShowingCount,
  leadPriorityOptions,
  leadSourceOptions,
  leadStatusOptions
} from "@/lib/lead-utils";
import { FollowUpState, LeadPriority, LeadSource, LeadStatus, LeadWithProperties } from "@/lib/types";

type StatusFilter = "all" | LeadStatus;
type PriorityFilter = "all" | LeadPriority;
type SourceFilter = "all" | LeadSource;
type FollowUpFilter = "all" | FollowUpState;
type StatQuickFilter = "all" | "scheduled" | "closed" | "overdue" | "highPriority" | "nextSevenDays";

export function DashboardClient({
  leads,
  isPreviewReadonly = false
}: {
  leads: LeadWithProperties[];
  isPreviewReadonly?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [priority, setPriority] = useState<PriorityFilter>("all");
  const [source, setSource] = useState<SourceFilter>("all");
  const [followUpState, setFollowUpState] = useState<FollowUpFilter>("all");
  const [moveInDate, setMoveInDate] = useState("");
  const [showingDate, setShowingDate] = useState("");
  const [statQuickFilter, setStatQuickFilter] = useState<StatQuickFilter>("all");
  const leadListRef = useRef<HTMLDivElement>(null);

  const filteredLeads = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return leads.filter((lead) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          lead.fullName,
          lead.phone,
          lead.email,
          lead.propertyAddress,
          ...lead.propertyInterests.flatMap((propertyInterest) => [
            propertyInterest.address,
            propertyInterest.listingTitle,
            propertyInterest.neighborhood
          ])
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedSearch));

      const matchesStatus = status === "all" || lead.status === status;
      const matchesPriority = priority === "all" || lead.priority === priority;
      const matchesSource = source === "all" || lead.source === source;
      const matchesFollowUpState =
        followUpState === "all" || getFollowUpState(lead.nextFollowUpDate) === followUpState;
      const matchesMoveInDate = !moveInDate || lead.desiredMoveInDate === moveInDate;
      const matchesShowingDate = !showingDate || lead.showingDate === showingDate;
      const matchesStatQuickFilter = getMatchesStatQuickFilter(lead, statQuickFilter);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesSource &&
        matchesFollowUpState &&
        matchesMoveInDate &&
        matchesShowingDate &&
        matchesStatQuickFilter
      );
    });
  }, [followUpState, leads, moveInDate, priority, search, showingDate, source, statQuickFilter, status]);

  const stats = {
    total: leads.length,
    scheduled: leads.filter((lead) => lead.showingDate && lead.showingTime).length,
    closed: leads.filter((lead) => lead.status === "closed").length,
    overdueFollowUps: leads.filter((lead) => getFollowUpState(lead.nextFollowUpDate) === "overdue").length,
    highPriority: leads.filter((lead) => lead.priority === "high" || lead.priority === "urgent").length,
    showingsToday: getUpcomingShowingCount(leads, 0),
    nextSevenDays: getUpcomingShowingCount(leads, 7)
  };

  const hasActiveFilters = Boolean(
    search ||
      status !== "all" ||
      priority !== "all" ||
      source !== "all" ||
      followUpState !== "all" ||
      moveInDate ||
      showingDate ||
      statQuickFilter !== "all"
  );

  function clearFilters() {
    setSearch("");
    setStatus("all");
    setPriority("all");
    setSource("all");
    setFollowUpState("all");
    setMoveInDate("");
    setShowingDate("");
    setStatQuickFilter("all");
  }

  function scrollToLeadList() {
    window.requestAnimationFrame(() => {
      leadListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function applyStatQuickFilter(nextFilter: StatQuickFilter) {
    setSearch("");
    setStatus("all");
    setPriority("all");
    setSource("all");
    setFollowUpState("all");
    setMoveInDate("");
    setShowingDate("");
    setStatQuickFilter(nextFilter);
    scrollToLeadList();
  }

  return (
    <main className="space-y-6">
      {isPreviewReadonly ? <PreviewModeBanner /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          label="Total Leads"
          value={stats.total}
          detail="Every active record in your pipeline"
          tone="from-slate-900/8 via-blue-500/10 to-white"
          isActive={statQuickFilter === "all" && !hasActiveFilters}
          onClick={() => applyStatQuickFilter("all")}
        />
        <StatCard
          label="Scheduled"
          value={stats.scheduled}
          detail="Showings already on the calendar"
          tone="from-emerald-400/18 to-white"
          isActive={statQuickFilter === "scheduled"}
          onClick={() => applyStatQuickFilter("scheduled")}
        />
        <StatCard
          label="Closed"
          value={stats.closed}
          detail="Leads that have already converted"
          tone="from-violet-400/14 to-white"
          isActive={statQuickFilter === "closed"}
          onClick={() => applyStatQuickFilter("closed")}
        />
        <StatCard
          label="Overdue Follow-Ups"
          value={stats.overdueFollowUps}
          detail="Leads needing attention now"
          tone="from-rose-400/16 to-white"
          isActive={statQuickFilter === "overdue"}
          onClick={() => applyStatQuickFilter("overdue")}
        />
        <StatCard
          label="High Priority"
          value={stats.highPriority}
          detail="High and urgent records in play"
          tone="from-amber-400/18 to-white"
          isActive={statQuickFilter === "highPriority"}
          onClick={() => applyStatQuickFilter("highPriority")}
        />
        <StatCard
          label="Showings Next 7 Days"
          value={stats.nextSevenDays}
          detail={`${stats.showingsToday} happening today`}
          tone="from-blue-400/16 to-white"
          isActive={statQuickFilter === "nextSevenDays"}
          onClick={() => applyStatQuickFilter("nextSevenDays")}
        />
      </section>

      <section className="app-panel p-5 sm:p-6">
        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
          <div>
            <p className="app-eyebrow">Lead Dashboard</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Your command center for leasing operations
            </h2>
            <p className="app-copy mt-3 max-w-2xl">
              Prioritize urgent follow-ups, keep tours moving, and surface the leads most likely to
              close next.
            </p>
            <p className="mt-4 text-sm font-medium text-slate-500">
              Sorted by priority, follow-up urgency, upcoming showing, and recent activity.
            </p>
          </div>
          <div className="rounded-4xl border border-line/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(255,255,255,0.98))] p-4 shadow-soft">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/80 bg-white px-4 py-4">
                <p className="app-kicker">Visible now</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                  {filteredLeads.length}
                </p>
              </div>
              <div className="rounded-3xl border border-white/80 bg-white px-4 py-4">
                <p className="app-kicker">Today</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">{stats.showingsToday}</p>
              </div>
              <div className="rounded-3xl border border-white/80 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(37,99,235,0.9))] px-4 py-4 text-white">
                <p className="app-kicker text-white/70">Focus</p>
                <p className="mt-2 text-base font-semibold">Keep urgent and overdue leads moving.</p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <LoadingLink href="/today" className="app-button-primary flex-1">
                Open Today
              </LoadingLink>
              <LoadingLink href="/leads/new" className="app-button-primary flex-1">
                Add New Lead
              </LoadingLink>
              <LoadingLink href="/routes" className="app-button-secondary flex-1">
                Open Routes
              </LoadingLink>
            </div>
          </div>
        </div>

        {leads.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-4xl border border-dashed border-line bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.9))] px-6 py-16 text-center">
            <p className="text-lg font-semibold tracking-tight text-ink">No leads yet</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Start your pipeline with a new lead and the dashboard will immediately organize
              follow-ups, priorities, and showings for you.
            </p>
            <LoadingLink href="/leads/new" className="app-button-primary mt-6">
              Add your first lead
            </LoadingLink>
          </div>
        ) : (
          <>
            <div className="mt-6 rounded-4xl border border-line/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,0.96))] p-4 shadow-soft sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="app-kicker">CRM Filters</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Narrow the pipeline by stage, lead quality, source, follow-up urgency, or
                    timing.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="app-chip">{hasActiveFilters ? "Filtered view" : "All leads"}</div>
                  <div className="app-chip">{filteredLeads.length} records</div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr]">
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Search
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name, phone, email, or property address"
                    aria-label="Search leads"
                    className="app-input"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Status
                  </span>
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value as StatusFilter)}
                    aria-label="Filter by status"
                    className="app-input"
                  >
                    <option value="all">All</option>
                    {leadStatusOptions.map((option) => (
                      <option key={option} value={option}>
                        {getStatusLabel(option)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Priority
                  </span>
                  <select
                    value={priority}
                    onChange={(event) => setPriority(event.target.value as PriorityFilter)}
                    aria-label="Filter by priority"
                    className="app-input"
                  >
                    <option value="all">All</option>
                    {leadPriorityOptions.map((option) => (
                      <option key={option} value={option}>
                        {getPriorityLabel(option)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Source
                  </span>
                  <select
                    value={source}
                    onChange={(event) => setSource(event.target.value as SourceFilter)}
                    aria-label="Filter by lead source"
                    className="app-input"
                  >
                    <option value="all">All</option>
                    {leadSourceOptions.map((option) => (
                      <option key={option} value={option}>
                        {getSourceLabel(option)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-[0.9fr_0.7fr_0.7fr_0.7fr_auto]">
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Follow-Up
                  </span>
                  <select
                    value={followUpState}
                    onChange={(event) => setFollowUpState(event.target.value as FollowUpFilter)}
                    aria-label="Filter by follow-up state"
                    className="app-input"
                  >
                    {followUpFilterOptions.map((option) => (
                      <option key={option} value={option}>
                        {option === "all" ? "All" : getFollowUpStateLabel(option)}
                      </option>
                    ))}
                  </select>
                </label>

                <DateInputField
                  label="Move-In Date"
                  value={moveInDate}
                  onChange={setMoveInDate}
                  ariaLabel="Filter by desired move-in date"
                  helperText="Use MM/DD/YYYY"
                  labelClassName="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"
                />

                <DateInputField
                  label="Showing Date"
                  value={showingDate}
                  onChange={setShowingDate}
                  ariaLabel="Filter by showing date"
                  helperText="Use MM/DD/YYYY"
                  labelClassName="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"
                />

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="app-button-secondary w-full disabled:cursor-not-allowed disabled:opacity-50 xl:w-auto"
                    disabled={!hasActiveFilters}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            <div ref={leadListRef} id="dashboard-lead-list" className="mt-6 scroll-mt-36">
              {filteredLeads.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-4xl border border-dashed border-line bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.9))] px-6 py-16 text-center">
                  <p className="text-lg font-semibold tracking-tight text-ink">No matching leads</p>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Try clearing a filter or broadening your search to bring high-value records back
                    into view.
                  </p>
                  <button type="button" onClick={clearFilters} className="app-button-primary mt-6">
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex flex-col gap-3 rounded-3xl border border-line/70 bg-white/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="app-kicker">Pipeline View</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Top records rise first by urgency, follow-up pressure, and upcoming showing windows.
                      </p>
                    </div>
                    <div className="app-chip">{filteredLeads.length} leads ready for action</div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    {filteredLeads.map((lead) => (
                      <LeadCard key={lead.id} lead={lead} isPreviewReadonly={isPreviewReadonly} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  detail,
  tone,
  isActive = false,
  onClick
}: {
  label: string;
  value: number;
  detail: string;
  tone: string;
  isActive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Show ${label.toLowerCase()} leads`}
      aria-pressed={isActive}
      aria-controls="dashboard-lead-list"
      className={`group w-full rounded-4xl border bg-gradient-to-br ${tone} p-5 text-left shadow-panel transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_24px_55px_-34px_rgba(15,23,42,0.65)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 ${
        isActive ? "border-accent/50 ring-4 ring-accent/10" : "border-white/80"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-semibold text-slate-600">{label}</p>
        <div className="rounded-2xl bg-white/90 px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
          Live
        </div>
      </div>
      <p className="mt-6 text-4xl font-semibold tracking-tight text-ink transition group-hover:text-accent group-focus-visible:text-accent">
        {value}
      </p>
      <p className="mt-3 max-w-[22ch] text-sm leading-6 text-slate-500">{detail}</p>
    </button>
  );
}

function getMatchesStatQuickFilter(lead: LeadWithProperties, statQuickFilter: StatQuickFilter) {
  switch (statQuickFilter) {
    case "scheduled":
      return Boolean(lead.showingDate && lead.showingTime);
    case "closed":
      return lead.status === "closed";
    case "overdue":
      return getFollowUpState(lead.nextFollowUpDate) === "overdue";
    case "highPriority":
      return lead.priority === "high" || lead.priority === "urgent";
    case "nextSevenDays":
      return isShowingWithinDays(lead, 7);
    case "all":
    default:
      return true;
  }
}

function isShowingWithinDays(lead: LeadWithProperties, withinDays: number) {
  if (!lead.showingDate) {
    return false;
  }

  const start = getTodayString();
  const end = new Date();
  end.setDate(end.getDate() + withinDays);
  const endString = end.toISOString().slice(0, 10);

  return lead.showingDate >= start && lead.showingDate <= endString;
}

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}
