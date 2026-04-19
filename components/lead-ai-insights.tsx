import { LoadingLink } from "@/components/loading-link";
import { PropertyInterestStatusBadge } from "@/components/property-interest-status-badge";
import { PropertyRatingStars } from "@/components/property-rating-stars";
import { getLeadAiInsights } from "@/lib/ai-insights";
import { LeadWithProperties } from "@/lib/types";

export function LeadAiInsights({ lead }: { lead: LeadWithProperties }) {
  const insights = getLeadAiInsights(lead);
  const nextActionLabel =
    insights.nextAction.type === "call"
      ? "Call Client"
      : insights.nextAction.type === "text"
        ? "Open Text Draft"
        : "Open Email Draft";

  return (
    <section className="app-panel p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="app-eyebrow">AI Assist</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            Productivity suggestions for this customer
          </h3>
          <p className="app-copy mt-2 max-w-3xl">
            Lightweight AI-style guidance helps summarize preferences, recommend the next outreach
            move, and surface the strongest property fit without interrupting the normal workflow.
          </p>
        </div>
        <div className="app-chip">Heuristic assistant</div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="app-subpanel p-5">
          <p className="app-kicker">Client Preferences Summary</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">{insights.preferenceSummary}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {insights.preferenceHighlights.length > 0 ? (
              insights.preferenceHighlights.map((highlight) => (
                <span
                  key={highlight}
                  className="rounded-full border border-line/80 bg-white px-3 py-1 text-xs font-semibold text-slate-600"
                >
                  {highlight}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-dashed border-line/80 bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                Add richer notes to sharpen this summary
              </span>
            )}
          </div>
        </div>

        <div className="app-subpanel p-5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="app-kicker">Suggested Follow-up</p>
            <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
              {insights.nextAction.label}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{insights.nextAction.reason}</p>
          <div className="mt-4 rounded-3xl border border-line/70 bg-white px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Message Draft
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {insights.nextAction.draft}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={insights.nextAction.href} className="app-button-primary">
              {nextActionLabel}
            </a>
            <a
              href={
                insights.nextAction.type === "call"
                  ? `sms:${lead.phone}?body=${encodeURIComponent(insights.nextAction.draft)}`
                  : `mailto:${lead.email}?subject=${encodeURIComponent(
                      `Follow-up for ${lead.fullName}`
                    )}&body=${encodeURIComponent(insights.nextAction.draft)}`
              }
              className="app-button-secondary"
            >
              Save as Alternate Draft
            </a>
          </div>
        </div>
      </div>

      <div className="mt-4 app-subpanel p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="app-kicker">Property Recommendation</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {insights.recommendedProperty?.reason ||
                "Add properties to this customer record to generate a property recommendation."}
            </p>
          </div>
          {insights.recommendedProperty ? (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
              {insights.recommendedProperty.confidenceLabel}
            </span>
          ) : null}
        </div>

        {insights.recommendedProperty ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.85fr]">
            <div className="rounded-3xl border border-white/90 bg-white px-4 py-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-base font-semibold tracking-tight text-ink">
                  {insights.recommendedProperty.property.listingTitle}
                </p>
                <PropertyInterestStatusBadge status={insights.recommendedProperty.property.status} />
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {insights.recommendedProperty.property.address}
              </p>
              <div className="mt-3">
                <PropertyRatingStars rating={insights.recommendedProperty.property.rating} />
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="app-chip">
                  {insights.recommendedProperty.property.rent || "Price not added"}
                </div>
                <div className="app-chip">
                  {insights.recommendedProperty.property.beds || "Beds not added"} bd
                </div>
                <div className="app-chip">
                  {insights.recommendedProperty.property.baths || "Baths not added"} ba
                </div>
                <div className="app-chip">
                  {insights.recommendedProperty.property.neighborhood || "Neighborhood not added"}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-line/70 bg-slate-50 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Why This Property
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                {insights.recommendedProperty.reasons.map((reason) => (
                  <li key={reason}>• {reason}</li>
                ))}
              </ul>
              <div className="mt-4">
                <LoadingLink
                  href={`/leads/${lead.id}/properties/${insights.recommendedProperty.property.id}`}
                  className="app-button-secondary"
                >
                  Open Recommended Property
                </LoadingLink>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-3xl border border-dashed border-line/80 bg-white px-4 py-6 text-sm text-slate-500">
            No property recommendation yet because this customer does not have tracked listings.
          </div>
        )}
      </div>
    </section>
  );
}
