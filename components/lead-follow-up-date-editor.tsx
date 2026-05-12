"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { DateInputField } from "@/components/date-input-field";
import { updateLeadFollowUpDate } from "@/lib/actions";
import { formatDateLabel } from "@/lib/date";

export function LeadFollowUpDateEditor({
  leadId,
  initialDate,
  redirectTo,
  isPreviewReadonly,
  compact = false
}: {
  leadId: string;
  initialDate: string;
  redirectTo: string;
  isPreviewReadonly: boolean;
  compact?: boolean;
}) {
  const [date, setDate] = useState(initialDate);

  return (
    <form
      action={updateLeadFollowUpDate}
      className={`rounded-2xl border border-line/70 bg-white/80 ${compact ? "px-3 py-3" : "px-4 py-3"}`}
    >
      <input type="hidden" name="id" value={leadId} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <DateInputField
        label="Next follow-up"
        name="nextFollowUpDate"
        value={date}
        onChange={setDate}
        helperText={compact ? "" : "Use calendar or MM/DD/YYYY"}
        labelClassName="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400"
      />
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-xs text-slate-500">{date ? formatDateLabel(date) : "Not set"}</p>
        <FollowUpSaveButton disabled={isPreviewReadonly || !date || date === initialDate} />
      </div>
    </form>
  );
}

function FollowUpSaveButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Saving" : "Save"}
    </button>
  );
}
