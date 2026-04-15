import Link from "next/link";
import { notFound } from "next/navigation";
import { PropertyInterestForm } from "@/components/property-interest-form";
import { PreviewModeBanner } from "@/components/preview-mode-banner";
import { PropertyRatingStars } from "@/components/property-rating-stars";
import { PropertyInterestStatusBadge } from "@/components/property-interest-status-badge";
import { TooltipShell } from "@/components/tooltip-shell";
import { markPropertyInterestToured, updatePropertyInterest } from "@/lib/actions";
import { isPreviewReadonlyMode } from "@/lib/deployment";
import {
  buildGoogleMapsSearchLink,
  getPropertyInterestSourceLabel
} from "@/lib/property-interest-utils";
import { getLeadById, getPropertyInterestById } from "@/lib/storage";

export default async function PropertyInterestDetailsPage({
  params
}: {
  params: Promise<{ id: string; propertyId: string }>;
}) {
  const { id, propertyId } = await params;
  const [lead, propertyInterest] = await Promise.all([
    getLeadById(id),
    getPropertyInterestById(id, propertyId)
  ]);

  if (!lead || !propertyInterest) {
    notFound();
  }

  const isPreviewReadonly = isPreviewReadonlyMode();
  const mapsLink = buildGoogleMapsSearchLink(propertyInterest.address);

  return (
    <main className="space-y-6">
      {isPreviewReadonly ? <PreviewModeBanner /> : null}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6">
          <div className="app-panel p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-3xl">
                <p className="app-eyebrow">Property Report</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                  {propertyInterest.listingTitle}
                </h1>
                <p className="mt-2 text-sm text-slate-500">{propertyInterest.address}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <PropertyInterestStatusBadge status={propertyInterest.status} />
                  <div className="app-chip">{getPropertyInterestSourceLabel(propertyInterest.source)}</div>
                  {propertyInterest.neighborhood ? <div className="app-chip">{propertyInterest.neighborhood}</div> : null}
                  <PropertyRatingStars rating={propertyInterest.rating} />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href={`/leads/${lead.id}`} className="app-button-secondary">
                  Back to Customer
                </Link>
                <a href={mapsLink} target="_blank" rel="noreferrer" className="app-button-secondary">
                  Open in Google Maps
                </a>
                <TooltipShell
                  disabled={!propertyInterest.listingUrl}
                  message="Add a listing URL to open the live listing from this report."
                >
                  <a
                    href={propertyInterest.listingUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className={`app-button-primary ${!propertyInterest.listingUrl ? "pointer-events-none opacity-55" : ""}`}
                    aria-disabled={!propertyInterest.listingUrl}
                  >
                    Open Listing
                  </a>
                </TooltipShell>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <InfoCard label="Rent / Price" value={propertyInterest.rent || "Not set"} />
              <InfoCard label="Layout" value={`${propertyInterest.beds || "?"} bd / ${propertyInterest.baths || "?"} ba`} />
              <InfoCard label="Neighborhood" value={propertyInterest.neighborhood || "Not set"} />
              <InfoCard label="Customer" value={lead.fullName} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="app-panel p-5 sm:p-6">
              <p className="app-eyebrow">Decision Notes</p>
              <div className="mt-5 grid gap-4">
                <TextCard label="Pros" value={propertyInterest.pros || "No pros recorded yet."} />
                <TextCard label="Cons" value={propertyInterest.cons || "No cons recorded yet."} />
              </div>
            </div>

            <div className="app-panel p-5 sm:p-6">
              <p className="app-eyebrow">Agent Perspective</p>
              <div className="mt-5 grid gap-4">
                <TextCard
                  label="Agent notes"
                  value={propertyInterest.agentNotes || "No agent notes recorded yet."}
                />
                <div className="rounded-3xl border border-line/70 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Quick action</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Mark the property as toured after a visit so active listings stay organized in
                    the customer record.
                  </p>
                  <div className="mt-4">
                    <TooltipShell
                      disabled={isPreviewReadonly}
                      message="Preview mode is read-only. Disable preview mode or use a live database to update property status."
                    >
                      <form action={markPropertyInterestToured}>
                        <input type="hidden" name="leadId" value={lead.id} />
                        <input type="hidden" name="propertyInterestId" value={propertyInterest.id} />
                        <button
                          type="submit"
                          disabled={isPreviewReadonly || propertyInterest.status === "toured"}
                          className="app-button-secondary disabled:cursor-not-allowed disabled:opacity-55"
                        >
                          {propertyInterest.status === "toured" ? "Already Toured" : "Mark Toured"}
                        </button>
                      </form>
                    </TooltipShell>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="app-panel p-5 sm:p-6">
          <p className="app-eyebrow">Update Property</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
            Keep this report current
          </h2>
          <p className="app-copy mt-2">
            Update the property status, rating, and notes as the customer tours listings and moves
            toward an application.
          </p>

          <div className="mt-6">
            <PropertyInterestForm
              action={updatePropertyInterest}
              leadId={lead.id}
              propertyInterest={propertyInterest}
              submitLabel="Update Property"
              isPreviewReadonly={isPreviewReadonly}
            />
          </div>
        </aside>
      </div>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-line/70 bg-slate-50 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function TextCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-line/70 bg-slate-50 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{value}</p>
    </div>
  );
}
