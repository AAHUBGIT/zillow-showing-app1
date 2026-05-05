import { notFound } from "next/navigation";
import Link from "next/link";
import { ClientPreferencesForm } from "@/components/client-preferences-form";
import { CommunicationWorkspace } from "@/components/communication-workspace";
import { LeadRecordPanel } from "@/components/lead-record-panel";
import { LeadAiInsights } from "@/components/lead-ai-insights";
import { LeadScheduleForm } from "@/components/lead-schedule-form";
import { LoadingLink } from "@/components/loading-link";
import { PropertyComparisonTable } from "@/components/property-comparison-table";
import { PropertyInterestCard } from "@/components/property-interest-card";
import { PreviewModeBanner } from "@/components/preview-mode-banner";
import { buildGoogleCalendarUrl } from "@/lib/calendar";
import { formatDateTimeLabel } from "@/lib/date";
import { isPreviewReadonlyMode } from "@/lib/deployment";
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
    <main className="space-y-6">
      {isPreviewReadonly ? <PreviewModeBanner /> : null}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6">
          <LeadRecordPanel lead={lead} calendarUrl={calendarUrl} />

          <LeadAiInsights lead={lead} />

          <ClientPreferencesForm lead={lead} isPreviewReadonly={isPreviewReadonly} />

          <CommunicationWorkspace
            lead={lead}
            templates={communicationWorkspace.templates}
            activities={communicationWorkspace.activities}
            isPreviewReadonly={isPreviewReadonly}
          />

          <div className="app-panel p-5 sm:p-6">
            <p className="app-eyebrow">Showing Snapshot</p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
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
          </div>

          <div className="app-panel p-5 sm:p-6">
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
              <div className="mt-6 rounded-4xl border border-dashed border-line bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.9))] px-6 py-14 text-center">
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
              <div className="mt-6 space-y-6">
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
                        />
                      ))}
                    </div>
                  </details>
                ) : null}
              </div>
            )}
          </div>
        </section>

        <aside id="schedule-showing" className="scroll-mt-28 app-panel p-5 sm:p-6">
          <p className="app-eyebrow">Scheduling</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">
            Assign or update showing
          </h3>
          <p className="app-copy mt-2">
            Update the showing date, time, notes, and status using this lead's primary target
            address. When a showing is scheduled, you can also send it straight to Google Calendar.
          </p>

          <div className="mt-5 app-subpanel p-4">
            <p className="app-kicker">Current Appointment</p>
            <p className="mt-2 text-sm text-slate-600">
              {lead.showingDate && lead.showingTime
                ? formatDateTimeLabel(lead.showingDate, lead.showingTime)
                : "No showing scheduled yet."}
            </p>
          </div>

          <LeadScheduleForm
            lead={lead}
            propertyListings={propertyListings}
            isPreviewReadonly={isPreviewReadonly}
          />
        </aside>
      </div>
    </main>
  );
}
