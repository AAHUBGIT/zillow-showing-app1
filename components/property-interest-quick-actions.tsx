"use client";

import { useFormStatus } from "react-dom";
import { InlineSpinner } from "@/components/inline-spinner";
import { TooltipShell } from "@/components/tooltip-shell";
import { quickUpdatePropertyInterest } from "@/lib/actions";
import { formatDateTimeLabel } from "@/lib/date";
import { PropertyInterestStatus } from "@/lib/types";

export function PropertyInterestQuickActions({
  leadId,
  propertyInterestId,
  currentStatus,
  suggestedShowingDate,
  suggestedShowingTime,
  isPreviewReadonly = false
}: {
  leadId: string;
  propertyInterestId: string;
  currentStatus: PropertyInterestStatus;
  suggestedShowingDate: string;
  suggestedShowingTime: string;
  isPreviewReadonly?: boolean;
}) {
  const redirectTo = `/leads/${leadId}/properties/${propertyInterestId}`;
  const suggestedLabel = formatDateTimeLabel(suggestedShowingDate, suggestedShowingTime);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <QuickActionForm
        leadId={leadId}
        propertyInterestId={propertyInterestId}
        redirectTo={redirectTo}
        status="toured"
        isPreviewReadonly={isPreviewReadonly}
        disabled={currentStatus === "toured"}
        label={currentStatus === "toured" ? "Already Toured" : "Mark Toured"}
      />
      <QuickActionForm
        leadId={leadId}
        propertyInterestId={propertyInterestId}
        redirectTo={redirectTo}
        status="rejected"
        isPreviewReadonly={isPreviewReadonly}
        disabled={currentStatus === "rejected"}
        label={currentStatus === "rejected" ? "Already Rejected" : "Mark Rejected"}
      />
      <QuickActionForm
        leadId={leadId}
        propertyInterestId={propertyInterestId}
        redirectTo={redirectTo}
        status="applying"
        isPreviewReadonly={isPreviewReadonly}
        disabled={currentStatus === "applying"}
        label={currentStatus === "applying" ? "Already Applying" : "Mark Applying"}
      />
      <QuickActionForm
        leadId={leadId}
        propertyInterestId={propertyInterestId}
        redirectTo={redirectTo}
        status="scheduled"
        showingDate={suggestedShowingDate}
        showingTime={suggestedShowingTime}
        isPreviewReadonly={isPreviewReadonly}
        label={`Schedule Showing`}
        helperText={`Suggested: ${suggestedLabel}`}
      />
    </div>
  );
}

function QuickActionForm({
  leadId,
  propertyInterestId,
  redirectTo,
  status,
  label,
  helperText,
  showingDate,
  showingTime,
  disabled = false,
  isPreviewReadonly = false
}: {
  leadId: string;
  propertyInterestId: string;
  redirectTo: string;
  status: PropertyInterestStatus;
  label: string;
  helperText?: string;
  showingDate?: string;
  showingTime?: string;
  disabled?: boolean;
  isPreviewReadonly?: boolean;
}) {
  return (
    <TooltipShell
      disabled={isPreviewReadonly}
      message="This preview workspace is read-only. Use a live workspace to update property workflow."
    >
      <form action={quickUpdatePropertyInterest} className="flex">
        <input type="hidden" name="leadId" value={leadId} />
        <input type="hidden" name="propertyInterestId" value={propertyInterestId} />
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <input type="hidden" name="status" value={status} />
        {showingDate ? <input type="hidden" name="showingDate" value={showingDate} /> : null}
        {showingTime ? <input type="hidden" name="showingTime" value={showingTime} /> : null}
        <QuickActionButton
          disabled={disabled || isPreviewReadonly}
          label={label}
          helperText={helperText}
        />
      </form>
    </TooltipShell>
  );
}

function QuickActionButton({
  disabled,
  label,
  helperText
}: {
  disabled: boolean;
  label: string;
  helperText?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="flex min-h-[72px] w-full flex-col items-start justify-center rounded-3xl border border-line/80 bg-white px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-accent disabled:cursor-not-allowed disabled:opacity-55"
    >
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
        {pending ? <InlineSpinner className="h-4 w-4" /> : null}
        {pending ? "Updating..." : label}
      </span>
      {helperText ? <span className="mt-1 text-xs text-slate-500">{helperText}</span> : null}
    </button>
  );
}
