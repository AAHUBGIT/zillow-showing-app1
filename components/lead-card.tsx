import Link from "next/link";
import { formatDateLabel, formatDateTimeLabel } from "@/lib/date";
import { Lead } from "@/lib/types";
import { LeadStatusBadge } from "./lead-status-badge";

export function LeadCard({ lead }: { lead: Lead }) {
  return (
    <article className="rounded-4xl border border-slate-100 bg-slate-50 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-ink">{lead.fullName}</p>
          <p className="mt-1 text-sm text-slate-600">{lead.propertyAddress}</p>
        </div>
        <LeadStatusBadge status={lead.status} />
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <InfoRow label="Move-in" value={formatDateLabel(lead.desiredMoveInDate)} />
        <InfoRow label="Phone" value={lead.phone} />
        <InfoRow label="Email" value={lead.email} />
        <InfoRow
          label="Showing"
          value={
            lead.showingDate && lead.showingTime
              ? formatDateTimeLabel(lead.showingDate, lead.showingTime)
              : "Not scheduled"
          }
        />
      </div>

      <p className="mt-4 line-clamp-2 text-sm text-slate-500">
        {lead.notes || "No notes yet."}
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={`/leads/${lead.id}`}
          className="inline-flex items-center justify-center rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Open Details
        </Link>
        <Link
          href={`/leads/${lead.id}`}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-accent hover:text-accent"
        >
          Schedule Showing
        </Link>
      </div>
    </article>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}
