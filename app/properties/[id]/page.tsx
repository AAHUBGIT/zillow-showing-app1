import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ContactActionLink } from "@/components/contact-action-link";
import { FollowUpQueueActions } from "@/components/follow-up-queue-actions";
import { LeadSidePanel } from "@/components/lead-side-panel";
import { LeadStatusBadge } from "@/components/lead-status-badge";
import { LoadingLink } from "@/components/loading-link";
import { PriorityBadge } from "@/components/priority-badge";
import { PropertyDecisionForm } from "@/components/property-decision-form";
import { PropertyListingEditForm } from "@/components/property-listing-edit-form";
import { PropertyInterestStatusBadge } from "@/components/property-interest-status-badge";
import { ShowingLifecycleBadge } from "@/components/showing-lifecycle-badge";
import { getSessionUser } from "@/lib/auth";
import { buildCallHref, buildLeadEmailHref, buildLeadTextHref } from "@/lib/contact-actions";
import { formatDateTimeLabel } from "@/lib/date";
import { isPreviewReadonlyMode } from "@/lib/deployment";
import { getFollowUpState, getSourceLabel } from "@/lib/lead-utils";
import {
  getDecisionStatusConfig,
  getAllDecisionStatusOptions,
  isDecisionStatusApplying,
  isDecisionStatusTerminal,
  normalizeDecisionStatus,
  type PropertyDecisionStatusConfig
} from "@/lib/property-decision-statuses";
import { getPrimaryFollowUpLabel } from "@/lib/follow-up-workflow";
import { buildGoogleMapsSearchLink } from "@/lib/property-interest-utils";
import {
  formatPropertyListingPrice,
  getPropertyListingLayout,
  getPropertyListingStatusLabel,
  getPropertyListingStatusTone,
  normalizePropertyListingAddress,
  normalizePropertyListingUrl
} from "@/lib/property-listing-utils";
import { getPropertyListingByIdForUser } from "@/lib/property-listings";
import { getShowingOutcomeLabel, getEffectiveShowingStatus } from "@/lib/showing-lifecycle";
import { getLeads } from "@/lib/storage";
import { getWorkflowSettingsForUser, type FollowUpDefaultOption } from "@/lib/workflow-settings";
import type { LeadSource, LeadWithProperties, PropertyInterest, PropertyInterestStatus, PropertyListing } from "@/lib/types";

type RelatedInterest = {
  lead: LeadWithProperties;
  propertyInterest: PropertyInterest;
};

type ShowingRow = {
  key: string;
  lead: LeadWithProperties;
  propertyInterest?: PropertyInterest;
  date: string;
  time: string;
  source: "lead" | "interest";
};

type PipelineEntry = {
  key: string;
  lead: LeadWithProperties;
  propertyInterest?: PropertyInterest;
  showingRow?: ShowingRow;
  decisionStatus: PropertyInterestStatus;
};

type PipelineGroup = {
  config: PropertyDecisionStatusConfig;
  entries: PipelineEntry[];
};

const unknownDecisionStatusConfig: PropertyDecisionStatusConfig = {
  value: "unknown" as PropertyInterestStatus,
  label: "Unknown / no decision",
  tone: "slate",
  className: "border-slate-200 bg-slate-100 text-slate-700",
  order: 1000,
  isActive: true
};

function matchesListing(
  listing: Pick<PropertyListing, "address" | "listingUrl" | "title">,
  input: Pick<PropertyInterest, "address" | "listingUrl" | "listingTitle">
) {
  const listingAddress = normalizePropertyListingAddress(listing.address);
  const inputAddress = normalizePropertyListingAddress(input.address);
  const listingUrl = normalizePropertyListingUrl(listing.listingUrl);
  const inputUrl = normalizePropertyListingUrl(input.listingUrl);

  return (
    (listingAddress && inputAddress && listingAddress === inputAddress) ||
    (listingUrl && inputUrl && listingUrl === inputUrl) ||
    (listing.title.trim().toLowerCase() === input.listingTitle.trim().toLowerCase() &&
      Boolean(input.listingTitle.trim()))
  );
}

function getRelatedInterests(listing: PropertyListing, leads: LeadWithProperties[]) {
  return leads.flatMap((lead) =>
    lead.propertyInterests
      .filter((propertyInterest) => matchesListing(listing, propertyInterest))
      .map((propertyInterest) => ({ lead, propertyInterest }))
  );
}

function getShowingRows(
  listing: PropertyListing,
  leads: LeadWithProperties[],
  relatedInterests: RelatedInterest[]
) {
  const listingAddress = normalizePropertyListingAddress(listing.address);
  const rows = new Map<string, ShowingRow>();

  for (const lead of leads) {
    const leadAddress = normalizePropertyListingAddress(lead.propertyAddress);

    if (lead.showingDate && lead.showingTime && listingAddress && leadAddress === listingAddress) {
      const key = `${lead.id}-${lead.showingDate}-${lead.showingTime}`;

      rows.set(key, {
        key,
        lead,
        date: lead.showingDate,
        time: lead.showingTime,
        source: "lead"
      });
    }
  }

  for (const { lead, propertyInterest } of relatedInterests) {
    if (!propertyInterest.showingDate || !propertyInterest.showingTime) {
      continue;
    }

    const key = `${lead.id}-${propertyInterest.showingDate}-${propertyInterest.showingTime}`;
    rows.set(key, {
      key,
      lead,
      propertyInterest,
      date: propertyInterest.showingDate,
      time: propertyInterest.showingTime,
      source: "interest"
    });
  }

  return Array.from(rows.values()).sort((first, second) =>
    `${first.date}T${first.time}` < `${second.date}T${second.time}` ? -1 : 1
  );
}

function getUniqueLeadCount(relatedInterests: RelatedInterest[], showingRows: ShowingRow[]) {
  return new Set([
    ...relatedInterests.map(({ lead }) => lead.id),
    ...showingRows.map(({ lead }) => lead.id)
  ]).size;
}

function getPipelineEntries(relatedInterests: RelatedInterest[], showingRows: ShowingRow[]) {
  const entries = new Map<string, PipelineEntry>();

  for (const { lead, propertyInterest } of relatedInterests) {
    const showingRow = showingRows.find((row) => {
      if (row.propertyInterest?.id === propertyInterest.id) {
        return true;
      }

      return row.lead.id === lead.id && !row.propertyInterest;
    });

    entries.set(`${lead.id}-${propertyInterest.id}`, {
      key: `${lead.id}-${propertyInterest.id}`,
      lead,
      propertyInterest,
      showingRow,
      decisionStatus: normalizeDecisionStatus(propertyInterest.status)
    });
  }

  for (const showingRow of showingRows) {
    const hasInterestEntry = Array.from(entries.values()).some(
      (entry) => entry.lead.id === showingRow.lead.id
    );

    if (!hasInterestEntry) {
      entries.set(`${showingRow.lead.id}-${showingRow.key}`, {
        key: `${showingRow.lead.id}-${showingRow.key}`,
        lead: showingRow.lead,
        showingRow,
        decisionStatus: unknownDecisionStatusConfig.value
      });
    }
  }

  return Array.from(entries.values());
}

function groupPipelineEntriesByDecisionStatus(
  entries: PipelineEntry[],
  decisionStatuses?: PropertyDecisionStatusConfig[]
) {
  const knownConfigs = getAllDecisionStatusOptions(decisionStatuses);
  const configByValue = new Map<PropertyInterestStatus, PropertyDecisionStatusConfig>(
    knownConfigs.map((config) => [config.value, config])
  );

  for (const entry of entries) {
    if (entry.decisionStatus === unknownDecisionStatusConfig.value) {
      configByValue.set(unknownDecisionStatusConfig.value, unknownDecisionStatusConfig);
      continue;
    }

    if (!configByValue.has(entry.decisionStatus)) {
      configByValue.set(
        entry.decisionStatus,
        getDecisionStatusConfig(entry.decisionStatus, decisionStatuses)
      );
    }
  }

  return Array.from(configByValue.values())
    .sort((first, second) => first.order - second.order)
    .map((config) => ({
      config,
      entries: entries.filter((entry) => entry.decisionStatus === config.value)
    }))
    .filter((group): group is PipelineGroup => group.entries.length > 0);
}

function getUniqueLeadEntries(entries: PipelineEntry[]) {
  const seen = new Set<string>();

  return entries.filter((entry) => {
    if (seen.has(entry.lead.id)) {
      return false;
    }

    seen.add(entry.lead.id);
    return true;
  });
}

function getNeedsFollowUpCount(entries: PipelineEntry[], decisionStatuses?: PropertyDecisionStatusConfig[]) {
  return getUniqueLeadEntries(entries).filter((entry) => {
    const followUpState = getFollowUpState(entry.lead.nextFollowUpDate);
    const showingStatus = getEffectiveShowingStatus(entry.lead);

    return (
      followUpState === "overdue" ||
      followUpState === "today" ||
      showingStatus === "completed" ||
      showingStatus === "no_show" ||
      isDecisionStatusApplying(entry.decisionStatus, decisionStatuses) ||
      (!entry.lead.nextFollowUpDate && entry.lead.status !== "closed")
    );
  }).length;
}

function getPropertyCommandNextAction(entries: PipelineEntry[], decisionStatuses?: PropertyDecisionStatusConfig[]) {
  if (entries.length === 0) {
    return "No active renters";
  }

  if (entries.some((entry) => isDecisionStatusApplying(entry.decisionStatus, decisionStatuses))) {
    return "Follow up with applying renter";
  }

  if (entries.some((entry) => getEffectiveShowingStatus(entry.lead) === "no_show")) {
    return "No-show: re-engage";
  }

  if (
    entries.some(
      (entry) =>
        getEffectiveShowingStatus(entry.lead) === "completed" &&
        !isDecisionStatusTerminal(entry.decisionStatus, decisionStatuses)
    )
  ) {
    return "Ask for decision";
  }

  if (entries.some((entry) => getFollowUpState(entry.lead.nextFollowUpDate) === "overdue")) {
    return "Follow-up overdue";
  }

  if (entries.some((entry) => getFollowUpState(entry.lead.nextFollowUpDate) === "today")) {
    return "Follow-up due today";
  }

  if (entries.some((entry) => Boolean(entry.showingRow))) {
    return "Showing scheduled";
  }

  return "Keep renters warm";
}

function getRenterNextAction(entry: PipelineEntry, decisionStatuses?: PropertyDecisionStatusConfig[]) {
  if (isDecisionStatusApplying(entry.decisionStatus, decisionStatuses)) {
    return "Follow up with applying renter";
  }

  const showingStatus = getEffectiveShowingStatus(entry.lead);
  const followUpState = getFollowUpState(entry.lead.nextFollowUpDate);

  if (showingStatus === "no_show") {
    return "No-show: re-engage";
  }

  if (showingStatus === "completed" && !isDecisionStatusTerminal(entry.decisionStatus, decisionStatuses)) {
    return "Ask for decision";
  }

  if (followUpState === "overdue") {
    return "Follow up overdue";
  }

  if (followUpState === "today") {
    return "Due today";
  }

  if (!entry.lead.nextFollowUpDate && entry.lead.status !== "closed") {
    return "Needs follow-up date";
  }

  if (entry.showingRow) {
    return "Showing scheduled";
  }

  return getPrimaryFollowUpLabel(entry.lead);
}

function getLastActivityLabel(lead: LeadWithProperties) {
  const activity = lead.lastActivity;

  if (!activity) {
    return "No activity logged";
  }

  return activity.outcome || activity.body || activity.subject || "Activity logged";
}

export default async function PropertyListingDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  const [listing, leads, workflowSettings] = await Promise.all([
    getPropertyListingByIdForUser(sessionUser.id, id),
    getLeads(),
    getWorkflowSettingsForUser(sessionUser.id)
  ]);

  if (!listing) {
    notFound();
  }

  const relatedInterests = getRelatedInterests(listing, leads);
  const showingRows = getShowingRows(listing, leads, relatedInterests);
  const pipelineEntries = getPipelineEntries(relatedInterests, showingRows);
  const uniqueLeadCount = getUniqueLeadCount(relatedInterests, showingRows);
  const isPreviewReadonly = isPreviewReadonlyMode();
  const activeInterestCount = relatedInterests.filter(
    ({ propertyInterest }) => !isDecisionStatusTerminal(propertyInterest.status, workflowSettings.decisionStatuses)
  ).length;
  const completedShowingCount = showingRows.filter(
    (row) => getEffectiveShowingStatus(row.lead) === "completed"
  ).length;
  const applyingCount = relatedInterests.filter(({ propertyInterest }) =>
    isDecisionStatusApplying(propertyInterest.status, workflowSettings.decisionStatuses)
  ).length;
  const rejectedCount = relatedInterests.filter(({ propertyInterest }) =>
    isDecisionStatusTerminal(propertyInterest.status, workflowSettings.decisionStatuses)
  ).length;
  const needsFollowUpCount = getNeedsFollowUpCount(pipelineEntries, workflowSettings.decisionStatuses);
  const propertyNextAction = getPropertyCommandNextAction(
    pipelineEntries,
    workflowSettings.decisionStatuses
  );
  const pipelineGroups = groupPipelineEntriesByDecisionStatus(
    pipelineEntries,
    workflowSettings.decisionStatuses
  );

  return (
    <main className="space-y-6">
      <section className="app-panel p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="app-eyebrow">Property Record</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {listing.title}
            </h1>
            <p className="app-copy mt-3 max-w-3xl">{listing.address}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPropertyListingStatusTone(
                  listing.status
                )}`}
              >
                {getPropertyListingStatusLabel(listing.status)}
              </span>
              <span className="app-chip">{formatPropertyListingPrice(listing.price)}</span>
              <span className="app-chip">{getPropertyListingLayout(listing)}</span>
              {listing.neighborhood ? <span className="app-chip">{listing.neighborhood}</span> : null}
              <span className="app-chip">{getSourceLabel(listing.source as LeadSource)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/properties" className="app-button-secondary">
              Back to Properties
            </Link>
            <LoadingLink href="/leads/new" className="app-button-primary">
              Schedule This Property
            </LoadingLink>
            <a href="#edit-property" className="app-button-secondary">
              Edit Property
            </a>
            <a href={buildGoogleMapsSearchLink(listing.address)} target="_blank" rel="noreferrer" className="app-button-secondary">
              Open Map
            </a>
            {listing.listingUrl ? (
              <a href={listing.listingUrl} target="_blank" rel="noreferrer" className="app-button-primary">
                Open Listing
              </a>
            ) : null}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Interested renters" value={String(uniqueLeadCount)} />
          <MetricCard label="Scheduled showings" value={String(showingRows.length)} />
          <MetricCard label="Completed tours" value={String(completedShowingCount)} />
          <MetricCard label="Needs follow-up" value={String(needsFollowUpCount)} />
          <MetricCard label="Applying" value={String(applyingCount)} />
          <MetricCard label="Rejected" value={String(rejectedCount)} />
          <MetricCard label="Active interests" value={String(activeInterestCount)} />
          <div className="app-grid-card">
            <p className="app-kicker">Next Action</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-ink">{propertyNextAction}</p>
          </div>
        </div>

        {listing.notes ? (
          <div className="mt-5 rounded-3xl border border-line/80 bg-slate-50/80 p-4">
            <p className="app-kicker">Access, Parking, and Showing Notes</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{listing.notes}</p>
          </div>
        ) : null}
      </section>

      <section id="edit-property" className="app-panel scroll-mt-28 p-5 sm:p-6">
        <details>
          <summary className="cursor-pointer list-none">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="app-eyebrow">Edit Property</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
                  Update inventory details
                </h2>
                <p className="app-copy mt-2 max-w-3xl">
                  Open only when price, layout, listing link, status, or notes need changes.
                </p>
              </div>
              <span className="app-chip">Expand editor</span>
            </div>
          </summary>
          <PropertyListingEditForm
            listing={listing}
            isPreviewReadonly={isPreviewReadonly}
            redirectTo={`/properties/${listing.id}`}
            buttonLabel="Save Property"
          />
        </details>
      </section>

      <section className="app-panel p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="app-eyebrow">Renter Pipeline</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
              Renters connected to this property
            </h2>
          </div>
          <span className="app-chip">{pipelineEntries.length} pipeline records</span>
        </div>

        {pipelineEntries.length > 0 ? (
          <div className="mt-5 space-y-4">
            {pipelineGroups.map((group) => (
              <div key={group.config.value} className="rounded-3xl border border-line/80 bg-slate-50/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${group.config.className}`}
                  >
                    {group.config.label}
                  </span>
                  <span className="app-chip">
                    {group.entries.length} {group.entries.length === 1 ? "renter" : "renters"}
                  </span>
                </div>

                <div className="mt-3 grid gap-3 2xl:grid-cols-2">
                  {group.entries.map((entry) => (
                    <RenterPipelineCard
                      key={entry.key}
                      entry={entry}
                      listing={listing}
                      decisionStatuses={workflowSettings.decisionStatuses}
                      defaultNextFollowUpOption={workflowSettings.defaultFollowUpOption}
                      isPreviewReadonly={isPreviewReadonly}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-3xl border border-dashed border-line bg-slate-50 px-5 py-8 text-center">
            <p className="text-sm font-semibold text-ink">This property has no renters attached yet.</p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Add a lead, schedule this property from a customer record, or attach it as an interested
              property to start tracking decisions and follow-up.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <LoadingLink href="/leads/new" className="app-button-primary">
                Add Lead
              </LoadingLink>
              <LoadingLink href="/properties" className="app-button-secondary">
                Open Inventory
              </LoadingLink>
            </div>
          </div>
        )}
      </section>

      <section className="app-panel p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="app-eyebrow">Showing Activity</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
              Showings for this property
            </h2>
          </div>
          <span className="app-chip">{showingRows.length} scheduled</span>
        </div>

        {showingRows.length > 0 ? (
          <div className="mt-5 grid gap-3">
            {showingRows.map((row) => {
              const status = getEffectiveShowingStatus(row.lead);
              const outcome = status === "completed" ? getShowingOutcomeLabel(row.lead.showingOutcome) : "";

              return (
                <div
                  key={row.key}
                  className="rounded-3xl border border-line/80 bg-white/85 px-4 py-3"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">{formatDateTimeLabel(row.date, row.time)}</p>
                      <p className="mt-1 text-sm text-slate-600">{row.lead.fullName}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="app-chip">
                          {row.source === "interest" ? "Property interest" : "Matched primary address"}
                        </span>
                        {outcome ? <span className="app-chip">Outcome: {outcome}</span> : null}
                        {row.lead.showingCanceledReason ? (
                          <span className="app-chip">Reason: {row.lead.showingCanceledReason}</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <ShowingLifecycleBadge lead={row.lead} />
                      <LeadSidePanel
                        lead={row.lead}
                        isPreviewReadonly={isPreviewReadonly}
                        redirectTo={`/properties/${listing.id}`}
                        triggerClassName="app-button-secondary"
                      />
                      <LoadingLink href={`/leads/${row.lead.id}`} className="app-button-primary">
                        Open Lead
                      </LoadingLink>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 rounded-3xl border border-dashed border-line bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
            No scheduled showings are linked to this property yet.
          </div>
        )}
      </section>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="app-grid-card">
      <p className="app-kicker">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function RenterPipelineCard({
  entry,
  listing,
  decisionStatuses,
  defaultNextFollowUpOption,
  isPreviewReadonly
}: {
  entry: PipelineEntry;
  listing: PropertyListing;
  decisionStatuses?: PropertyDecisionStatusConfig[];
  defaultNextFollowUpOption: FollowUpDefaultOption;
  isPreviewReadonly: boolean;
}) {
  const { lead, propertyInterest, showingRow } = entry;
  const phone = lead.phone.trim();
  const email = lead.email.trim();
  const showingLabel = showingRow
    ? formatDateTimeLabel(showingRow.date, showingRow.time)
    : propertyInterest?.showingDate && propertyInterest.showingTime
      ? formatDateTimeLabel(propertyInterest.showingDate, propertyInterest.showingTime)
      : lead.showingDate && lead.showingTime
        ? formatDateTimeLabel(lead.showingDate, lead.showingTime)
        : "Not scheduled";
  const nextAction = getRenterNextAction(entry, decisionStatuses);
  const lastActivity = getLastActivityLabel(lead);
  const redirectTo = `/properties/${listing.id}`;

  return (
    <article className="rounded-2xl border border-line/80 bg-white px-4 py-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold text-ink">{lead.fullName}</p>
            <LeadStatusBadge status={lead.status} />
            <PriorityBadge priority={lead.priority} />
          </div>
          <p className="mt-1 text-sm text-slate-600">{phone || email || "No contact saved"}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <PropertyInterestStatusBadge
              status={entry.decisionStatus}
              decisionStatuses={decisionStatuses}
            />
            <ShowingLifecycleBadge lead={lead} />
            <span className="app-chip">Next: {nextAction}</span>
          </div>
        </div>

        {propertyInterest ? (
          <PropertyDecisionForm
            leadId={lead.id}
            propertyInterest={propertyInterest}
            redirectTo={redirectTo}
            decisionStatuses={decisionStatuses}
            isPreviewReadonly={isPreviewReadonly}
          />
        ) : (
          <span className="app-chip">No attached property decision</span>
        )}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <CompactInfo label="Showing" value={showingLabel} />
        <CompactInfo label="Follow-up" value={lead.nextFollowUpDate || "Not set"} />
        <CompactInfo label="Last activity" value={lastActivity} />
        <CompactInfo label="Source" value={getSourceLabel(lead.source)} />
      </div>

      {propertyInterest?.clientFeedback || propertyInterest?.agentNotes ? (
        <div className="mt-3 grid gap-2 lg:grid-cols-2">
          {propertyInterest.clientFeedback ? (
            <p className="line-clamp-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
              {propertyInterest.clientFeedback}
            </p>
          ) : null}
          {propertyInterest.agentNotes ? (
            <p className="line-clamp-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
              {propertyInterest.agentNotes}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <ContactActionLink
          action="call"
          href={buildCallHref(phone)}
          disabled={!phone}
          className="app-button-secondary min-h-[38px] px-3 py-2 text-xs"
        />
        <ContactActionLink
          action="text"
          href={buildLeadTextHref(lead)}
          disabled={!phone}
          className="app-button-secondary min-h-[38px] px-3 py-2 text-xs"
        />
        <ContactActionLink
          action="email"
          href={buildLeadEmailHref(lead)}
          disabled={!email}
          className="app-button-secondary min-h-[38px] px-3 py-2 text-xs"
        />
        <LeadSidePanel
          lead={lead}
          isPreviewReadonly={isPreviewReadonly}
          redirectTo={redirectTo}
          triggerClassName="app-button-secondary min-h-[38px] px-3 py-2 text-xs"
        />
        <LoadingLink href={`/leads/${lead.id}`} className="app-button-primary min-h-[38px] px-3 py-2 text-xs">
          Open Lead
        </LoadingLink>
        {propertyInterest ? (
          <LoadingLink
            href={`/leads/${lead.id}/properties/${propertyInterest.id}`}
            className="app-button-secondary min-h-[38px] px-3 py-2 text-xs"
          >
            View Interest
          </LoadingLink>
        ) : null}
        <FollowUpQueueActions
          lead={lead}
          redirectTo={redirectTo}
          defaultNextFollowUpOption={defaultNextFollowUpOption}
          isPreviewReadonly={isPreviewReadonly}
          variant="card"
        />
      </div>
    </article>
  );
}

function CompactInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line/70 bg-slate-50 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-700">{value}</p>
    </div>
  );
}
