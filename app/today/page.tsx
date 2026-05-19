import Link from "next/link";
import { ContactActionLink } from "@/components/contact-action-link";
import { FollowUpQueueActions } from "@/components/follow-up-queue-actions";
import { LeadStatusBadge } from "@/components/lead-status-badge";
import { LoadingLink } from "@/components/loading-link";
import { PreviewModeBanner } from "@/components/preview-mode-banner";
import { PriorityBadge } from "@/components/priority-badge";
import { ShowingLifecycleActions } from "@/components/showing-lifecycle-actions";
import { ShowingLifecycleBadge } from "@/components/showing-lifecycle-badge";
import { getBedroomBathroomLabel, getBudgetLabel, getPreScreenStatus } from "@/lib/client-preferences";
import { getCommunicationChannelLabel } from "@/lib/communication";
import { buildCallHref, buildLeadEmailHref, buildLeadTextHref } from "@/lib/contact-actions";
import { formatDateLabel, formatDateTimeLabel, formatTimeForManualEntry } from "@/lib/date";
import { getSessionUser } from "@/lib/auth";
import { isPreviewReadonlyMode } from "@/lib/deployment";
import { getFollowUpActionLabels, getPrimaryFollowUpLabel } from "@/lib/follow-up-workflow";
import { buildGoogleMapsSearchLink } from "@/lib/property-interest-utils";
import { isRouteReadyLead, sortRouteStops } from "@/lib/route-planner";
import { getEffectiveShowingStatus, isTerminalShowingStatus } from "@/lib/showing-lifecycle";
import { getWorkflowSettingsForUser, type FollowUpDefaultOption } from "@/lib/workflow-settings";
import { getLeads } from "@/lib/storage";
import { LeadWithProperties } from "@/lib/types";

const appTimeZone = process.env.APP_TIME_ZONE || "America/New_York";
const todaySectionIds = {
  showings: "todays-showings",
  overdue: "overdue-follow-ups",
  dueToday: "follow-ups-due-today",
  highPriority: "high-priority-leads"
} as const;

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function getSelectedIsoDate(searchParams: Record<string, string | string[] | undefined> | undefined, fallback: string) {
  const date = getParam(searchParams?.date);

  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : fallback;
}

export default async function TodayPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const [leads, sessionUser] = await Promise.all([getLeads(), getSessionUser()]);
  const workflowSettings = await getWorkflowSettingsForUser(sessionUser?.id);
  const today = getTodayIsoDate(appTimeZone);
  const selectedDate = getSelectedIsoDate(searchParams, today);
  const selectedDateLabel = formatDateLabel(selectedDate);
  const isViewingToday = selectedDate === today;
  const isPreviewReadonly = isPreviewReadonlyMode();

  const todaysShowings = leads
    .filter((lead) => lead.showingDate === selectedDate && isRouteReadyLead(lead))
    .sort(sortByShowingTimeThenName);

  const upcomingShowings = leads
    .filter((lead) => lead.showingDate > selectedDate && isRouteReadyLead(lead))
    .sort(sortByShowingDateThenTimeThenName)
    .slice(0, 5);

  const overdueFollowUps = leads
    .filter(
      (lead) =>
        lead.status !== "closed" &&
        Boolean(lead.nextFollowUpDate) &&
        lead.nextFollowUpDate < selectedDate
    )
    .sort((first, second) => first.nextFollowUpDate.localeCompare(second.nextFollowUpDate));

  const followUpsDueToday = leads
    .filter((lead) => lead.status !== "closed" && lead.nextFollowUpDate === selectedDate)
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
          <DateNavigator selectedDate={selectedDate} today={today} label={selectedDateLabel} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label={isViewingToday ? "Showings Today" : "Showings"}
          value={todaysShowings.length}
          detail="Tours on the calendar"
          href={`#${todaySectionIds.showings}`}
        />
        <SummaryCard
          label="Overdue Follow-Ups"
          value={overdueFollowUps.length}
          detail="Oldest first below"
          href={`#${todaySectionIds.overdue}`}
        />
        <SummaryCard
          label={isViewingToday ? "Due Today" : "Due This Date"}
          value={followUpsDueToday.length}
          detail="Follow-ups for this workday"
          href={`#${todaySectionIds.dueToday}`}
        />
        <SummaryCard
          label="High Priority Open"
          value={highPriorityOpenLeads.length}
          detail="Urgent and high leads"
          href={`#${todaySectionIds.highPriority}`}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <CommandSection
            id={todaySectionIds.showings}
            title={isViewingToday ? "Today's Showings" : `${selectedDateLabel} Showings`}
            eyebrow="Showing Schedule"
            emptyTitle={isViewingToday ? "No showings today" : "No showings scheduled"}
            emptyDetail={
              isViewingToday
                ? "You're clear for now. New scheduled showings for today will appear here automatically."
                : "No scheduled showings are saved for this date."
            }
            isEmpty={todaysShowings.length === 0}
          >
            <div className="grid gap-3">
              {todaysShowings.map((lead) => (
                <ShowingCard key={lead.id} lead={lead} isPreviewReadonly={isPreviewReadonly} />
              ))}
            </div>
          </CommandSection>

          {todaysShowings.length === 0 && upcomingShowings.length > 0 ? (
            <CommandSection
              title="Upcoming Next"
              eyebrow="Next Scheduled"
              emptyTitle="No upcoming showings"
              emptyDetail="Upcoming scheduled showings will appear here."
              isEmpty={false}
            >
              <div className="grid gap-3">
                {upcomingShowings.map((lead) => (
                  <UpcomingShowingCard key={lead.id} lead={lead} />
                ))}
              </div>
            </CommandSection>
          ) : null}
        </div>

        <CommandSection
          title="Route Snapshot"
          eyebrow="Daily Route"
          emptyTitle={isViewingToday ? "No showings today" : "No route stops"}
          emptyDetail={
            isViewingToday
              ? "Route stops will appear here as soon as today has scheduled showings."
              : "Route stops will appear here when this date has scheduled showings."
          }
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
          id={todaySectionIds.overdue}
          title="Overdue Follow-ups"
          eyebrow="Needs Attention"
          emptyTitle="No overdue follow-ups"
          emptyDetail="You're clear for now."
          isEmpty={overdueFollowUps.length === 0}
        >
          <LeadList
            leads={overdueFollowUps}
            selectedDate={selectedDate}
            showFollowUpDate
            allowMarkFollowedUp
            isPreviewReadonly={isPreviewReadonly}
            defaultNextFollowUpOption={workflowSettings.defaultFollowUpOption}
          />
        </CommandSection>

        <CommandSection
          id={todaySectionIds.dueToday}
          title={isViewingToday ? "Follow-ups Due Today" : "Follow-ups Due This Date"}
          eyebrow={isViewingToday ? "Due Today" : "Due This Date"}
          emptyTitle={isViewingToday ? "No follow-ups due today" : "No follow-ups due on this date"}
          emptyDetail="You're clear for now."
          isEmpty={followUpsDueToday.length === 0}
        >
          <LeadList
            leads={followUpsDueToday}
            selectedDate={selectedDate}
            allowMarkFollowedUp
            isPreviewReadonly={isPreviewReadonly}
            defaultNextFollowUpOption={workflowSettings.defaultFollowUpOption}
          />
        </CommandSection>
      </section>

      <CommandSection
        id={todaySectionIds.highPriority}
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
  id,
  title,
  eyebrow,
  emptyTitle,
  emptyDetail,
  isEmpty,
  action,
  children
}: {
  id?: string;
  title: string;
  eyebrow: string;
  emptyTitle: string;
  emptyDetail: string;
  isEmpty: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-40 app-panel p-5 sm:p-6">
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

function DateNavigator({
  selectedDate,
  today,
  label
}: {
  selectedDate: string;
  today: string;
  label: string;
}) {
  const previousDate = shiftIsoDate(selectedDate, -1);
  const nextDate = shiftIsoDate(selectedDate, 1);

  return (
    <div className="flex flex-col gap-2 rounded-3xl border border-line/80 bg-white/90 px-3 py-3 shadow-sm sm:min-w-[320px]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="app-chip">{label}</span>
        <div className="flex flex-wrap gap-1.5">
          <Link href={`/today?date=${previousDate}`} className="app-button-secondary min-h-[36px] px-3 py-1.5 text-xs">
            Prev
          </Link>
          <Link href="/today" className="app-button-secondary min-h-[36px] px-3 py-1.5 text-xs">
            Today
          </Link>
          <Link href={`/today?date=${nextDate}`} className="app-button-secondary min-h-[36px] px-3 py-1.5 text-xs">
            Next
          </Link>
        </div>
      </div>
      <form className="flex gap-2">
        <label className="sr-only" htmlFor="today-date">View date</label>
        <input
          id="today-date"
          type="date"
          name="date"
          defaultValue={selectedDate}
          className="app-input min-h-[40px] flex-1 px-3 py-2 text-sm"
        />
        <button type="submit" className="app-button-primary min-h-[40px] px-3 py-2 text-sm">
          View
        </button>
      </form>
      {selectedDate !== today ? (
        <p className="text-xs font-medium text-slate-500">Default view is today. This page is showing a selected date.</p>
      ) : null}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  href
}: {
  label: string;
  value: number;
  detail: string;
  href: string;
}) {
  return (
    <a
      href={href}
      aria-label={`View ${label}`}
      className="group block rounded-4xl border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-5 shadow-panel transition hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_24px_55px_-34px_rgba(15,23,42,0.65)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20"
    >
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p className="mt-5 text-4xl font-semibold tracking-tight text-ink transition group-hover:text-accent group-focus-visible:text-accent">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        View section
      </p>
    </a>
  );
}

function ShowingCard({ lead, isPreviewReadonly }: { lead: LeadWithProperties; isPreviewReadonly: boolean }) {
  const showingStatus = getEffectiveShowingStatus(lead);
  const isTerminal = isTerminalShowingStatus(showingStatus);

  return (
    <article
      className={`rounded-3xl border px-4 py-4 shadow-sm ${
        isTerminal ? "border-slate-200 bg-slate-50/90 opacity-90" : "border-line/80 bg-white"
      }`}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold text-accent">
              {formatTimeForManualEntry(lead.showingTime)}
            </div>
            <ShowingLifecycleBadge status={showingStatus} />
            <PriorityBadge priority={lead.priority} />
            <LeadStatusBadge status={lead.status} />
          </div>
          <p className="mt-3 text-lg font-semibold tracking-tight text-ink">{lead.fullName}</p>
          <p className="mt-1 text-sm text-slate-600">{lead.phone}</p>
          <p className="mt-1 text-sm leading-5 text-slate-600">{lead.propertyAddress}</p>
          <PreferenceIndicators lead={lead} />
          <LastActivity activity={lead.lastActivity} />
        </div>
        <div className="flex flex-col gap-3 lg:items-end">
          <QuickActions lead={lead} includeMaps />
          <ShowingLifecycleActions
            lead={lead}
            redirectTo="/today#todays-showings"
            mode="quick"
            isPreviewReadonly={isPreviewReadonly}
            rescheduleHref={`/leads/${lead.id}#schedule-showing`}
          />
        </div>
      </div>
    </article>
  );
}

function UpcomingShowingCard({ lead }: { lead: LeadWithProperties }) {
  return (
    <article className="rounded-3xl border border-line/80 bg-white px-4 py-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {formatDateTimeLabel(lead.showingDate, lead.showingTime)}
            </div>
            <ShowingLifecycleBadge lead={lead} />
            <PriorityBadge priority={lead.priority} />
            <LeadStatusBadge status={lead.status} />
          </div>
          <p className="mt-3 text-base font-semibold tracking-tight text-ink">{lead.fullName}</p>
          <p className="mt-1 text-sm leading-5 text-slate-600">{lead.propertyAddress}</p>
        </div>
        <QuickActions lead={lead} includeMaps />
      </div>
    </article>
  );
}

function LeadList({
  leads,
  selectedDate,
  showFollowUpDate = false,
  allowMarkFollowedUp = false,
  isPreviewReadonly = false,
  defaultNextFollowUpOption = "tomorrow"
}: {
  leads: LeadWithProperties[];
  selectedDate: string;
  showFollowUpDate?: boolean;
  allowMarkFollowedUp?: boolean;
  isPreviewReadonly?: boolean;
  defaultNextFollowUpOption?: FollowUpDefaultOption;
}) {
  return (
    <div className="grid gap-2.5">
      {leads.map((lead) => {
        const followUpLabels = getFollowUpActionLabels(lead, selectedDate);
        const redirectTo = `/today?date=${selectedDate}`;

        return (
          <article key={lead.id} className="rounded-[1.35rem] border border-line/80 bg-white px-4 py-3 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <p className="text-base font-semibold tracking-tight text-ink">{lead.fullName}</p>
                  <p className="text-sm text-slate-600">{lead.phone}</p>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <PriorityBadge priority={lead.priority} />
                  <LeadStatusBadge status={lead.status} />
                  {followUpLabels.map((label) => (
                    <span key={label} className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                      {label}
                    </span>
                  ))}
                </div>
                <PreferenceIndicators lead={lead} />
                <LastActivity activity={lead.lastActivity} />
                {showFollowUpDate || allowMarkFollowedUp ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-rose-700">
                      {showFollowUpDate
                        ? `Follow-up was due ${formatDateLabel(lead.nextFollowUpDate)}`
                        : "Follow-up due today"}
                    </p>
                    {allowMarkFollowedUp ? (
                      <FollowUpQueueActions
                        lead={lead}
                        redirectTo={redirectTo}
                        defaultNextFollowUpOption={defaultNextFollowUpOption}
                        isPreviewReadonly={isPreviewReadonly}
                        variant="queue"
                      />
                    ) : null}
                  </div>
                ) : null}
              </div>
              <QuickActions lead={lead} />
            </div>
          </article>
        );
      })}
    </div>
  );
}

function HighPriorityCard({ lead }: { lead: LeadWithProperties }) {
  const showingLabel =
    lead.showingDate && lead.showingTime
      ? formatDateTimeLabel(lead.showingDate, lead.showingTime)
      : "No showing scheduled";
  const actionLabel = getPrimaryFollowUpLabel(lead);

  return (
    <article className="rounded-3xl border border-line/80 bg-white px-4 py-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <PriorityBadge priority={lead.priority} />
            <LeadStatusBadge status={lead.status} />
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              {actionLabel}
            </span>
          </div>
          <p className="mt-3 text-lg font-semibold tracking-tight text-ink">{lead.fullName}</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <InfoPill label="Next follow-up" value={lead.nextFollowUpDate ? formatDateLabel(lead.nextFollowUpDate) : "Not set"} />
            <InfoPill label="Showing" value={showingLabel} />
          </div>
          <PreferenceIndicators lead={lead} />
          <LastActivity activity={lead.lastActivity} />
        </div>
        <QuickActions lead={lead} includeMaps={Boolean(lead.propertyAddress)} />
      </div>
    </article>
  );
}

function QuickActions({ lead, includeMaps = false }: { lead: LeadWithProperties; includeMaps?: boolean }) {
  const phone = lead.phone.trim();
  const email = lead.email.trim();
  const hasPhone = phone.length > 0;
  const hasEmail = email.length > 0;

  return (
    <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
      <LoadingLink href={`/leads/${lead.id}`} className="app-button-primary min-h-[42px] px-3.5 py-2 text-sm">
        View Lead
      </LoadingLink>
      <ContactActionLink
        action="call"
        href={buildCallHref(phone)}
        disabled={!hasPhone}
        className="app-button-secondary min-h-[42px] px-3.5 py-2 text-sm"
      />
      <ContactActionLink
        action="text"
        href={buildLeadTextHref(lead)}
        disabled={!hasPhone}
        className="app-button-secondary min-h-[42px] px-3.5 py-2 text-sm"
      />
      <ContactActionLink
        action="email"
        href={buildLeadEmailHref(lead)}
        disabled={!hasEmail}
        className="app-button-secondary min-h-[42px] px-3.5 py-2 text-sm"
      />
      {includeMaps ? (
        <a
          href={buildGoogleMapsSearchLink(lead.propertyAddress)}
          target="_blank"
          rel="noreferrer"
          className="app-button-secondary min-h-[42px] px-3.5 py-2 text-sm"
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

function PreferenceIndicators({ lead }: { lead: LeadWithProperties }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      <span className="rounded-full border border-line/80 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
        Budget: {getBudgetLabel(lead)}
      </span>
      <span className="rounded-full border border-line/80 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
        {getBedroomBathroomLabel(lead)}
      </span>
      <span className="rounded-full border border-line/80 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
        {getPreScreenStatus(lead)}
      </span>
      {lead.applicationReady ? (
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          Application ready
        </span>
      ) : null}
    </div>
  );
}

function LastActivity({ activity }: { activity: LeadWithProperties["lastActivity"] }) {
  if (!activity) {
    return (
      <p className="mt-1.5 text-sm text-slate-500">
        Last activity: none logged
      </p>
    );
  }

  return (
    <div className="mt-2 rounded-2xl border border-line/70 bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Last activity
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-700">
        {getCommunicationChannelLabel(activity.channel)} - {formatActivityDate(activity.createdAt)}
      </p>
      <p className="mt-1 line-clamp-1 text-sm leading-5 text-slate-600">
        {activity.outcome || activity.subject || activity.body}
      </p>
    </div>
  );
}

function formatActivityDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-slate-50/90 px-5 py-8 text-center">
      <p className="text-base font-semibold tracking-tight text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{detail}</p>
    </div>
  );
}

function sortByShowingTimeThenName(first: LeadWithProperties, second: LeadWithProperties) {
  return first.showingTime.localeCompare(second.showingTime) || first.fullName.localeCompare(second.fullName);
}

function sortByShowingDateThenTimeThenName(first: LeadWithProperties, second: LeadWithProperties) {
  return (
    first.showingDate.localeCompare(second.showingDate) ||
    first.showingTime.localeCompare(second.showingTime) ||
    first.fullName.localeCompare(second.fullName)
  );
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

function shiftIsoDate(value: string, days: number) {
  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
