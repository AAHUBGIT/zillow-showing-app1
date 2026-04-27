"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { usePathname } from "next/navigation";
import { InlineSpinner } from "@/components/inline-spinner";
import { TooltipShell } from "@/components/tooltip-shell";
import { updateLeadStatus } from "@/lib/actions";
import { getStatusLabel, leadStatusOptions } from "@/lib/lead-utils";
import { LeadStatus } from "@/lib/types";

export function LeadStatusForm({
  leadId,
  currentStatus,
  isPreviewReadonly = false
}: {
  leadId: string;
  currentStatus: LeadStatus;
  isPreviewReadonly?: boolean;
}) {
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    if (!isChanged) {
      return;
    }

    const timeout = setTimeout(() => setIsChanged(false), 1200);
    return () => clearTimeout(timeout);
  }, [isChanged]);

  return (
    <form
      ref={formRef}
      action={updateLeadStatus}
      className={`rounded-2xl border p-2 transition ${
        isChanged ? "border-accent bg-accent/5 shadow-soft" : "border-line/80 bg-slate-50"
      }`}
    >
      <input type="hidden" name="id" value={leadId} />
      <input type="hidden" name="redirectTo" value={pathname} />
      <label className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Status
        </span>
        <div className="flex items-center gap-2">
          <TooltipShell
            disabled={isPreviewReadonly}
            message="This preview workspace is read-only. Use a live workspace to update lead status."
          >
            <select
              name="status"
              defaultValue={currentStatus}
              disabled={isPreviewReadonly}
              aria-label="Update lead status"
              onChange={() => {
                if (isPreviewReadonly) {
                  return;
                }

                setIsChanged(true);
                formRef.current?.requestSubmit();
              }}
              className="app-input w-full py-2.5 disabled:cursor-not-allowed disabled:opacity-55"
            >
              {leadStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {getStatusLabel(option)}
                </option>
              ))}
            </select>
          </TooltipShell>
          <StatusPending />
        </div>
      </label>
    </form>
  );
}

function StatusPending() {
  const { pending } = useFormStatus();

  return (
    <div
      className={`inline-flex min-w-[92px] items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition ${
        pending ? "bg-accent text-white" : "bg-slate-200 text-slate-500"
      }`}
    >
      {pending ? <InlineSpinner className="h-3.5 w-3.5" /> : null}
      {pending ? "Saving" : "Ready"}
    </div>
  );
}
