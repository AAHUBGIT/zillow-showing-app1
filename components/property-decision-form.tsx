"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { InlineSpinner } from "@/components/inline-spinner";
import { PropertyInterestStatusBadge } from "@/components/property-interest-status-badge";
import { TooltipShell } from "@/components/tooltip-shell";
import { updatePropertyDecision } from "@/lib/actions";
import { fieldMaxLengths } from "@/lib/form-validation";
import {
  getDecisionStatusLabel,
  getDecisionStatusOptions,
  isDefaultDecisionStatus,
  normalizeDecisionStatus,
  type PropertyDecisionStatusConfig
} from "@/lib/property-decision-statuses";
import type { PropertyInterest, PropertyInterestStatus } from "@/lib/types";

const feedbackReasonOptions: Partial<Record<PropertyInterestStatus, string[]>> = {
  rejected: [
    "Price too high",
    "Wrong location",
    "Too small",
    "Bad layout",
    "Missing must-have",
    "Renter disliked it",
    "Other"
  ],
  maybe: [
    "Needs second look",
    "Waiting on spouse/family",
    "Comparing with another property",
    "Price concern",
    "Timing concern",
    "Other"
  ],
  applying: [
    "Application submitted",
    "Waiting on documents",
    "Wants application link",
    "Needs guarantor",
    "Other"
  ],
  backup: ["Backup option", "Waiting on first choice", "Other"],
  needs_second_look: ["Needs second look", "Timing concern", "Other"]
};

export function PropertyDecisionForm({
  leadId,
  propertyInterest,
  redirectTo,
  decisionStatuses,
  isPreviewReadonly = false
}: {
  leadId: string;
  propertyInterest: PropertyInterest;
  redirectTo: string;
  decisionStatuses?: PropertyDecisionStatusConfig[];
  isPreviewReadonly?: boolean;
}) {
  const currentStatus = normalizeDecisionStatus(propertyInterest.status, decisionStatuses);
  const options = getDecisionStatusOptions(decisionStatuses);
  const initialSelectedStatus = isDefaultDecisionStatus(currentStatus, decisionStatuses)
    ? currentStatus
    : options[0]?.value || "interested";
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<PropertyInterestStatus>(initialSelectedStatus);
  const reasonOptions = useMemo(
    () => feedbackReasonOptions[selectedStatus] || [],
    [selectedStatus]
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <PropertyInterestStatusBadge status={currentStatus} decisionStatuses={decisionStatuses} />
        <TooltipShell
          disabled={isPreviewReadonly}
          message="This preview workspace is read-only. Use a live workspace to update property decisions."
        >
          <button
            type="button"
            disabled={isPreviewReadonly}
            onClick={() => setIsOpen(true)}
            className="app-button-secondary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-55"
          >
            Decision
          </button>
        </TooltipShell>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/35 px-4 py-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`decision-dialog-${propertyInterest.id}`}
            className="w-full max-w-xl rounded-4xl border border-line/80 bg-white p-5 shadow-panel"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="app-eyebrow">Property Decision</p>
                <h3
                  id={`decision-dialog-${propertyInterest.id}`}
                  className="mt-2 text-xl font-semibold tracking-tight text-ink"
                >
                  Update renter decision
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Track where this listing sits in the renter&apos;s shortlist.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="app-button-secondary px-4 py-2 text-sm"
              >
                Close
              </button>
            </div>

            <form action={updatePropertyDecision} className="mt-5 grid gap-4">
              <input type="hidden" name="leadId" value={leadId} />
              <input type="hidden" name="propertyInterestId" value={propertyInterest.id} />
              <input type="hidden" name="redirectTo" value={redirectTo} />

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Decision status
                <select
                  name="decisionStatus"
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value as PropertyInterestStatus)}
                  className="app-input"
                >
                  {options.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>

              {reasonOptions.length > 0 ? (
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Reason
                  <select name="decisionReason" className="app-input" defaultValue="">
                    <option value="">No reason selected</option>
                    {reasonOptions.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Optional note
                <textarea
                  name="decisionNote"
                  rows={4}
                  maxLength={fieldMaxLengths.agentNotes}
                  className="app-input min-h-[120px] resize-y"
                  placeholder={`What changed about ${getDecisionStatusLabel(selectedStatus, decisionStatuses).toLowerCase()}?`}
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-slate-500">
                  Updates save to the property and log an internal activity entry.
                </p>
                <SubmitDecisionButton />
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

function SubmitDecisionButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="app-button-primary disabled:opacity-55">
      {pending ? (
        <>
          <InlineSpinner />
          <span>Saving...</span>
        </>
      ) : (
        "Save decision"
      )}
    </button>
  );
}
