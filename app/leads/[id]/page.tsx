import { notFound } from "next/navigation";
import Link from "next/link";
import { ClientPreferencesForm } from "@/components/client-preferences-form";
import { CommunicationWorkspace } from "@/components/communication-workspace";
import { FollowUpQueueActions } from "@/components/follow-up-queue-actions";
import { LeadRecordPanel } from "@/components/lead-record-panel";
import { LeadAiInsights } from "@/components/lead-ai-insights";
import { LeadScheduleForm } from "@/components/lead-schedule-form";
import { LoadingLink } from "@/components/loading-link";
import { PropertyComparisonTable } from "@/components/property-comparison-table";
import { PropertyDecisionTracker } from "@/components/property-decision-tracker";
import { PropertyInterestCard } from "@/components/property-interest-card";
import { PreviewModeBanner } from "@/components/preview-mode-banner";
import { buildGoogleCalendarUrl } from "@/lib/calendar";
import { formatDateLabel, formatDateTimeLabel } from "@/lib/date";
import { isPreviewReadonlyMode } from "@/lib/deployment";
import { getFollowUpActionLabels, getPrimaryFollowUpLabel } from "@/lib/follow-up-workflow";
import { ShowingLifecycleActions } from "@/components/showing-lifecycle-actions";
import { ShowingLifecycleBadge } from "@/components/showing-lifecycle-badge";
import { getShowingOutcomeLabel } from "@/lib/showing-lifecycle";
import {
  getPropertyInterestCountLabel,
  getTopRatedProperty,
  isActivePropertyInterest,
  isRejectedPropertyInterest
} from "@/lib/property-interest-utils";
import { getPropertyListings } from "@/lib/property-listings";
import { getCommunicationWorkspace, getLeadById } from "@/lib/storage";

export default async function LeadDetailsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [lead, communicationWorkspace, propertyListings] = await Promise.all([
    getLeadById(id),
    getCommunicationWorkspace(id),
    getPropertyListings()
  ]);

  if (!lead) {
    notFound();
  }

  const calendarUrl = buildGoogleCalendarUrl(lead);
  const isPreviewReadonly = isPreviewReadonlyMode();
  const activeProperties = lead.propertyInterests.filter(isActivePropertyInterest);
  const rejectedProperties = lead.propertyInterests.filter(isRejectedPropertyInterest);
  const activePropertyCount = activeProperties.length;
  const topRatedProperty = getTopRatedProperty(activeProperties);
  const addPropertyHref = `/leads/${lead.id}/properties/new`;
  const comparisonProperties =
    activeProperties.length > 0
      ? [...activeProperties, ...rejectedProperties]
      : lead.propertyInterests;

  return (
    <main className="lead-detail-workflow space-y-5">
      {isPreviewReadonly ? <PreviewModeBanner /> : null}

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-5">
          <div id="customer-overview" className="scroll-mt-28">
            <LeadRecordPanel lead={lead} calendarUrl={calendarUrl} />
          </div>

          <LeadWorkflowJumpBar />

          <div id="follow-up" className="app-panel scroll-mt-28 p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="app-eyebrow">Follow-Up</p>
                  <span className="app-chip">{getPrimaryFollowUpLabel(lead)}</span>
                </div>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">
                  Follow-up control
                </h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-2xl border border-line/70 bg-slate-50 px-3 py-3">
                    <p className="app-kicker">Next follow-up</p>
                    <p className="mt-1 text-sm font-semibold text-ink">
                      {lead.nextFollowUpDate ? formatDateLabel(lead.nextFollowUpDate) : "Not set"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-line/70 bg-slate-50 px-3 py-3">
                    <p className="app-kicker">Last activity</p>
                    <p className="mt-1 line-clamp-1 text-sm font-semibold text-ink">
                      {communicationWorkspace.activities[0]
                        ? communicationWorkspace.activities[0].outcome ||
                          communicationWorkspace.activities[0].subject ||
                          "Activity logged"
                        : "None logged"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {getFollowUpActionLabels(lead).map((label) => (
                    <span key={label} className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              <FollowUpQueueActions
                lead={lead}
                redirectTo={`/leads/${lead.id}#follow-up`}
                isPreviewReadonly={isPreviewReadonly}
                variant="panel"
              />
            </div>
          </div>

          <div id="showing-snapshot" className="app-panel scroll-mt-28 p-4 sm:p-5">
            <p className="app-eyebrow">Showing Snapshot</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <ShowingLifecycleBadge lead={lead} />
              {lead.showingOutcome ? (
                <span className="app-chip">Outcome: {getShowingOutcomeLabel(lead.showingOutcome)}</span>
              ) : null}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="app-grid-card">
                <p className="app-kicker">Current Showing</p>
                <p className="mt-2 text-base font-semibold text-ink">
                  {lead.showingDate && lead.showingTime
                    ? formatDateTimeLabel(lead.showingDate, lead.showingTime)
                    : "No showing scheduled yet."}
                </p>
              </div>
              <div className="app-grid-card">
                <p className="app-kicker">Property</p>
                <p className="mt-2 text-base font-semibold text-ink">{lead.propertyAddress}</p>
              </div>
              <div className="app-grid-card">
                <p className="app-kicker">Agent Notes</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {lead.agentNotes || "No agent notes yet."}
                </p>
              </div>
            </div>
            {lead.showingDate && lead.showingTime ? (
              <div className="mt-4 rounded-3xl border border-line/80 bg-white/85 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="app-kicker">Showing Lifecycle</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Confirm the appointment, record the outcome, or move it into no-show,
                      canceled, or rescheduled without losing the activity trail.
                    </p>
                    {lead.showingOutcomeNotes ? (
                      <p className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                        {lead.showingOutcomeNotes}
                      </p>
                    ) : null}
                    {lead.showingCanceledReason ? (
                      <p className="mt-3 rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        {lead.showingCanceledReason}
                      </p>
                    ) : null}
                  </div>
                  <div className="w-full lg:max-w-md">
                    <ShowingLifecycleActions
                      lead={lead}
                      redirectTo={`/leads/${lead.id}`}
                      mode="full"
                      isPreviewReadonly={isPreviewReadonly}
                      rescheduleHref="#schedule-showing"
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div id="interested-properties" className="app-panel scroll-mt-28 p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="app-eyebrow">Interested Properties</p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                  Touring and leasing shortlist
                </h3>
                <p className="app-copy mt-2 max-w-2xl">
                  Track every listing this customer is comparing, document what stands out, and
                  keep the strongest options at the top of the record.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:items-end">
                <div className="flex flex-wrap gap-2">
                  <div className="app-chip">{getPropertyInterestCountLabel(lead.propertyInterests.length)}</div>
                  <div className="app-chip">{activePropertyCount} active</div>
                </div>
                <Link href={addPropertyHref} className="app-button-primary">
                  Add Property
                </Link>
              </div>
            </div>

            {lead.propertyInterests.length === 0 ? (
              <div className="mt-5 rounded-4xl border border-dashed border-line bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.9))] px-6 py-10 text-center">
                <p className="text-lg font-semibold tracking-tight text-ink">No properties tracked yet</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Add the listings this customer is considering so you can compare options, capture
                  pros and cons, and keep touring decisions in one place.
                </p>
                <Link href={addPropertyHref} className="app-button-primary mt-6">
                  Add First Property
                </Link>
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                <PropertyDecisionTracker lead={lead} propertyInterests={lead.propertyInterests} />

                {topRatedProperty ? (
                  <div className="rounded-4xl border border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,251,235,0.98),rgba(255,255,255,0.96))] p-5 shadow-soft">
                    <p className="app-kicker text-amber-700">Top Rated Property</p>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold tracking-tight text-ink">
                          {topRatedProperty.listingTitle}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">{topRatedProperty.address}</p>
                      </div>
                      <LoadingLink
                        href={`/leads/${lead.id}/properties/${topRatedProperty.id}`}
                        className="app-button-secondary"
                      >
                        Open Top Property
                      </LoadingLink>
                    </div>
                  </div>
                ) : null}

                {comparisonProperties.length > 0 ? (
                  <div>
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="app-kicker">Compare Properties</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Review pricing, layout, neighborhood, status, rating, and tradeoffs side by side.
                        </p>
                      </div>
                      <div className="app-chip">Scroll sideways on mobile</div>
                    </div>
                    <PropertyComparisonTable lead={lead} propertyInterests={comparisonProperties} />
                  </div>
                ) : null}

                {activeProperties.length > 0 ? (
                  <div>
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="app-kicker">Active Properties</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Listings still in the decision pipeline, sorted with the strongest options first.
                        </p>
                      </div>
                      <div className="app-chip">{activeProperties.length} active</div>
                    </div>
                    <div className="grid gap-4 xl:grid-cols-2">
                      {activeProperties.map((propertyInterest) => (
                        <PropertyInterestCard
                          key={propertyInterest.id}
                          lead={lead}
                          leadId={lead.id}
                          propertyInterest={propertyInterest}
                          isTopRated={topRatedProperty?.id === propertyInterest.id}
                          isPreviewReadonly={isPreviewReadonly}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}

                {rejectedProperties.length > 0 ? (
                  <details className="rounded-4xl border border-line/80 bg-white/80 p-5 shadow-soft">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-slate-700">
                      Rejected Properties ({rejectedProperties.length})
                    </summary>
                    <p className="mt-3 text-sm text-slate-500">
                      Keep past no-go listings here for context without letting them crowd the active shortlist.
                    </p>
                    <div className="mt-5 grid gap-4 xl:grid-cols-2">
                      {rejectedProperties.map((propertyInterest) => (
                        <PropertyInterestCard
                          key={propertyInterest.id}
                          lead={lead}
                          leadId={lead.id}
                          propertyInterest={propertyInterest}
                          isPreviewReadonly={isPreviewReadonly}
                        />
                      ))}
                    </div>
                  </details>
                ) : null}
              </div>
            )}
          </div>

          <div id="preferences" className="scroll-mt-28">
            <ClientPreferencesForm lead={lead} isPreviewReadonly={isPreviewReadonly} />
          </div>

          <div id="smart-assist" className="scroll-mt-28">
            <LeadAiInsights lead={lead} />
          </div>

          <div id="communication" className="scroll-mt-28">
            <CommunicationWorkspace
              lead={lead}
              templates={communicationWorkspace.templates}
              activities={communicationWorkspace.activities}
              isPreviewReadonly={isPreviewReadonly}
            />
          </div>
        </section>

        <aside id="schedule-showing" className="scroll-mt-28 app-panel p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="app-eyebrow">Scheduling</p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">
                Showing editor
              </h3>
              <p className="app-copy mt-2">
                Update date, time, status, and location from the lead address, saved properties,
                inventory, or a typed address.
              </p>
            </div>
            <a href="#showing-snapshot" className="app-chip hover:border-accent hover:text-accent">
              View status
            </a>
          </div>

          <div className="mt-5 app-subpanel p-4">
            <p className="app-kicker">Current Appointment</p>
            <p className="mt-2 text-sm text-slate-600">
              {lead.showingDate && lead.showingTime
                ? formatDateTimeLabel(lead.showingDate, lead.showingTime)
                : "No showing scheduled yet."}
            </p>
          </div>

          <details className="mt-4" open={!lead.showingDate || !lead.showingTime}>
            <summary className="cursor-pointer list-none rounded-3xl border border-line/80 bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm transition hover:border-accent hover:text-accent">
              {lead.showingDate && lead.showingTime ? "Edit schedule and location" : "Open schedule setup"}
            </summary>
            <LeadScheduleForm
              lead={lead}
              propertyListings={propertyListings}
              isPreviewReadonly={isPreviewReadonly}
            />
          </details>
        </aside>
      </div>
    </main>
  );
}

function LeadWorkflowJumpBar() {
  const links = [
    { href: "#customer-overview", label: "Overview" },
    { href: "#follow-up", label: "Follow-Up" },
    { href: "#showing-snapshot", label: "Showing" },
    { href: "#interested-properties", label: "Properties" },
    { href: "#preferences", label: "Preferences" },
    { href: "#communication", label: "Communication" },
    { href: "#recent-activity", label: "Activity" },
    { href: "#schedule-showing", label: "Schedule" },
    { href: "#smart-assist", label: "Smart Assist" }
  ];

  return (
    <nav
      aria-label="Customer workflow shortcuts"
      className="rounded-3xl border border-line/80 bg-white/90 px-4 py-3 shadow-soft"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Jump to
        </span>
        {links.map((link) => (
          <a key={link.href} href={link.href} className="app-chip hover:border-accent hover:text-accent">
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
