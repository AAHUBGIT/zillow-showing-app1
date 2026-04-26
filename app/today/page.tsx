import { LeadStatusBadge } from "@/components/lead-status-badge";
import { LoadingLink } from "@/components/loading-link";
import { PreviewModeBanner } from "@/components/preview-mode-banner";
import { PriorityBadge } from "@/components/priority-badge";
import { formatDateLabel, formatDateTimeLabel, formatTimeForManualEntry } from "@/lib/date";
import { isPreviewReadonlyMode } from "@/lib/deployment";
import { buildGoogleMapsSearchLink } from "@/lib/property-interest-utils";
import { isRouteReadyLead, sortRouteStops } from "@/lib/route-planner";
import { getLeads } from "@/lib/storage";
import { LeadWithProperties } from "@/lib/types";

const appTimeZone = process.env.APP_TIME_ZONE || "America/New_York";

export default async function TodayPage() {
  const leads = await getLeads();
  const today = getTodayIsoDate(appTimeZone);
  const todayLabel = formatDateLabel(today);
  const isPreviewReadonly = isPreviewReadonlyMode();

  const todaysShowings = leads
    .filter((lead) => lead.showingDate === today && isRouteReadyLead(lead))
    .sort(sortByShowingTimeThenName);

  const overdueFollowUps = leads
    .filter((lead) => Boolean(lead.nextFollowUpDate) && lead.nextFollowUpDate < today)
    .sort((first, second) => first.nextFollowUpDate.localeCompare(second.nextFollowUpDate));

  const followUpsDueToday = leads
    .filter((lead) => lead.nextFollowUpDate === today)
    .sort(sortByPriorityThenName);

  const highPriorityOpenLeads = leads
    .filter((lead) => lead.status !== "closed" && (lead.priority === "urgent" || lead.priority === "high"))
    .sort(sortByPriorityThenName);

  const routeStops = sortRouteStops(todaysShowings);

  return (
    <main className="space-y-6">
      {isPreviewReadonly ? <PreviewModeBanner /> : null}

      <section className="app-panel p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="app-eyebrow">Today</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Today Command Center
            </h2>
            <p className="app-copy mt-2">
              Your daily operating screen for showings, overdue follow-ups, route stops, and the
              highest-priority leads that still need movement.
            </p>
          </div>
          <div className="app-chip">{todayLabel}</div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Showings Today" value={todaysShowings.length} detail="Tours on the calendar" />
        <SummaryCard label="Overdue Follow-Ups" value={overdueFollowUps.length} detail="Oldest first below" />
        <SummaryCard label="Due Today" value={followUpsDueToday.length} detail="Follow-ups for this workday" />
        <SummaryCard label="High Priority Open" value={highPriorityOpenLeads.length} detail="Urgent and high leads" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <CommandSection
          title="Today's Showings"
          eyebrow="Showing Schedule"
          emptyTitle="No showings today"
          emptyDetail="You're clear for now. New scheduled showings for today will appear here automatically."
          isEmpty={todaysShowings.length === 0}
        >
          <div className="grid gap-3">
            {todaysShowings.map((lead) => (
              <ShowingCard key={lead.id} lead={lead} />
            ))}
          </div>
        </CommandSection>

        <CommandSection
          title="Route Snapshot"
          eyebrow="Daily Route"
          emptyTitle="No showings today"
          emptyDetail="Route stops will appear here as soon as today has scheduled showings."
          isEmpty={routeStops.length === 0}
          action={<LoadingLink href="/routes" className="app-button-secondary">Open Routes</LoadingLink>}
        >
          <div className="grid gap-3">
            {routeStops.map((lead, index) => (
              <div key={lead.id} className="rounded-3xl border border-line/80 bg-white px-4 py-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                      Stop {index + 1}
                    </p>
                    <p className="mt-1 truncate text-base font-semibold text-ink">{lead.fullName}</p>
                    <p className="mt-1 text-sm leading-5 text-slate-600">{lead.propertyAddress}</p>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {formatTimeForManualEntry(lead.showingTime)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CommandSection>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <CommandSection
          title="Overdue Follow-ups"
          eyebrow="Needs Attention"
          emptyTitle="No overdue follow-ups"
          emptyDetail="You're clear for now."
          isEmpty={overdueFollowUps.length === 0}
        >
          <LeadList leads={overdueFollowUps} showFollowUpDate />
        </CommandSection>

        <CommandSection
          title="Follow-ups Due Today"
          eyebrow="Due Today"
          emptyTitle="No follow-ups due today"
          emptyDetail="You're clear for now."
          isEmpty={followUpsDueToday.length === 0}
        >
          <LeadList leads={followUpsDueToday} showBadges />
        </CommandSection>
      </section>

      <CommandSection
        title="High Priority Leads"
        eyebrow="Open Priority"
        emptyTitle="No high priority open leads"
        emptyDetail="New urgent or high-priority leads will appear here while they are still open."
        isEmpty={highPriorityOpenLeads.length === 0}
      >
        <div className="grid gap-3 xl:grid-cols-2">
          {highPriorityOpenLeads.map((lead) => (
            <HighPriorityCard key={lead.id} lead={lead} />
          ))}
        </div>
      </CommandSection>
    </main>
  );
}

function CommandSection({
  title,
  eyebrow,
  emptyTitle,
  emptyDetail,
  isEmpty,
  action,
  children
}: {
  title: string;
  eyebrow: string;
  emptyTitle: string;
  emptyDetail: string;
  isEmpty: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="app-panel p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="app-kicker">{eyebrow}</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">{title}</h3>
        </div>
        {action}
      </div>
      <div className="mt-5">
        {isEmpty ? <EmptyState title={emptyTitle} detail={emptyDetail} /> : children}
      </div>
    </section>
  );
}

function SummaryCard({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="rounded-4xl border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-5 shadow-panel">
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p className="mt-5 text-4xl font-semibold tracking-tight text-ink">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p>
    </div>
  );
}

function ShowingCard({ lead }: { lead: LeadWithProperties }) {
  return (
    <article className="rounded-3xl border border-line/80 bg-white px-4 py-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold text-accent">
              {formatTimeForManualEntry(lead.showingTime)}
            </div>
            <PriorityBadge priority={lead.priority} />
            <LeadStatusBadge status={lead.status} />
          </div>
          <p className="mt-3 text-lg font-semibold tracking-tight text-ink">{lead.fullName}</p>
          <p className="mt-1 text-sm text-slate-600">{lead.phone}</p>
          <p className="mt-1 text-sm leading-5 text-slate-600">{lead.propertyAddress}</p>
        </div>
        <QuickActions lead={lead} includeMaps />
      </div>
    </article>
  );
}

function LeadList({
  leads,
  showBadges = false,
  showFollowUpDate = false
}: {
  leads: LeadWithProperties[];
  showBadges?: boolean;
  showFollowUpDate?: boolean;
}) {
  return (
    <div className="grid gap-3">
      {leads.map((lead) => (
        <article key={lead.id} className="rounded-3xl border border-line/80 bg-white px-4 py-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-base font-semibold tracking-tight text-ink">{lead.fullName}</p>
              <p className="mt-1 text-sm text-slate-600">{lead.phone}</p>
              {showFollowUpDate ? (
                <p className="mt-2 text-sm font-medium text-rose-700">
                  Follow-up was due {formatDateLabel(lead.nextFollowUpDate)}
                </p>
              ) : null}
              {showBadges ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <PriorityBadge priority={lead.priority} />
                  <LeadStatusBadge status={lead.status} />
                </div>
              ) : null}
            </div>
            <QuickActions lead={lead} />
          </div>
        </article>
      ))}
    </div>
  );
}

function HighPriorityCard({ lead }: { lead: LeadWithProperties }) {
  const showingLabel =
    lead.showingDate && lead.showingTime
      ? formatDateTimeLabel(lead.showingDate, lead.showingTime)
      : "No showing scheduled";

  return (
    <article className="rounded-3xl border border-line/80 bg-white px-4 py-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <PriorityBadge priority={lead.priority} />
            <LeadStatusBadge status={lead.status} />
          </div>
          <p className="mt-3 text-lg font-semibold tracking-tight text-ink">{lead.fullName}</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <InfoPill label="Next follow-up" value={lead.nextFollowUpDate ? formatDateLabel(lead.nextFollowUpDate) : "Not set"} />
            <InfoPill label="Showing" value={showingLabel} />
          </div>
        </div>
        <QuickActions lead={lead} includeMaps={Boolean(lead.propertyAddress)} />
      </div>
    </article>
  );
}

function QuickActions({ lead, includeMaps = false }: { lead: LeadWithProperties; includeMaps?: boolean }) {
  return (
    <div className="flex w-full flex-wrap gap-2 lg:w-auto lg:justify-end">
      <LoadingLink href={`/leads/${lead.id}`} className="app-button-primary min-h-[48px] px-4 py-2.5">
        View Lead
      </LoadingLink>
      <a href={getPhoneHref("tel", lead.phone)} className="app-button-secondary min-h-[48px] px-4 py-2.5">
        Call
      </a>
      <a href={getPhoneHref("sms", lead.phone)} className="app-button-secondary min-h-[48px] px-4 py-2.5">
        Text
      </a>
      <a href={`mailto:${lead.email}`} className="app-button-secondary min-h-[48px] px-4 py-2.5">
        Email
      </a>
      {includeMaps ? (
        <a
          href={buildGoogleMapsSearchLink(lead.propertyAddress)}
          target="_blank"
          rel="noreferrer"
          className="app-button-secondary min-h-[48px] px-4 py-2.5"
        >
          Open Maps
        </a>
      ) : null}
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line/70 bg-slate-50 px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-slate-50/90 px-5 py-8 text-center">
      <p className="text-base font-semibold tracking-tight text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{detail}</p>
    </div>
  );
}

function getPhoneHref(protocol: "tel" | "sms", phone: string) {
  const normalized = phone.replace(/[^\d+]/g, "");
  return `${protocol}:${normalized || phone}`;
}

function sortByShowingTimeThenName(first: LeadWithProperties, second: LeadWithProperties) {
  return first.showingTime.localeCompare(second.showingTime) || first.fullName.localeCompare(second.fullName);
}

const priorityRank = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3
};

function sortByPriorityThenName(first: LeadWithProperties, second: LeadWithProperties) {
  return priorityRank[first.priority] - priorityRank[second.priority] || first.fullName.localeCompare(second.fullName);
}

function getTodayIsoDate(timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}
