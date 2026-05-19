"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { updateFollowUpQueue } from "@/lib/actions";
import type { LeadWithProperties } from "@/lib/types";
import type { FollowUpDefaultOption } from "@/lib/workflow-settings";

type DialogType = "followed_up" | "snooze" | "no_answer" | "add_note" | "set_date";
type Variant = "queue" | "panel" | "card";

const resultOptions = [
  { value: "called", label: "Called" },
  { value: "texted", label: "Texted" },
  { value: "emailed", label: "Emailed" },
  { value: "no_answer", label: "No answer" },
  { value: "left_voicemail", label: "Left voicemail" },
  { value: "spoke", label: "Spoke with renter" },
  { value: "internal_note", label: "Internal note" }
];

const nextFollowUpOptions = [
  { value: "tomorrow", label: "Tomorrow" },
  { value: "two_days", label: "In 2 days" },
  { value: "next_week", label: "Next week" },
  { value: "custom", label: "Custom date" },
  { value: "none", label: "No next follow-up" }
];

const snoozeOptions = nextFollowUpOptions.filter((option) => option.value !== "none");

export function FollowUpQueueActions({
  lead,
  redirectTo,
  defaultNextFollowUpOption = "tomorrow",
  isPreviewReadonly = false,
  variant = "queue"
}: {
  lead: LeadWithProperties;
  redirectTo: string;
  defaultNextFollowUpOption?: FollowUpDefaultOption;
  isPreviewReadonly?: boolean;
  variant?: Variant;
}) {
  const [dialog, setDialog] = useState<DialogType | null>(null);
  const buttonClass =
    variant === "panel"
      ? "app-button-secondary min-h-[38px] px-3 py-2 text-xs"
      : "app-button-secondary min-h-[36px] px-3 py-1.5 text-xs";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={isPreviewReadonly}
        onClick={() => setDialog("followed_up")}
        className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-55`}
      >
        Followed up
      </button>

      <button
        type="button"
        disabled={isPreviewReadonly}
        onClick={() => setDialog("snooze")}
        className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-55`}
      >
        Snooze
      </button>

      {variant === "queue" ? (
        <button
          type="button"
          disabled={isPreviewReadonly}
          onClick={() => setDialog("no_answer")}
          className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-55`}
        >
          Log no answer
        </button>
      ) : null}

      {variant !== "card" ? (
        <button
          type="button"
          disabled={isPreviewReadonly}
          onClick={() => setDialog("add_note")}
          className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-55`}
        >
          Add note
        </button>
      ) : null}

      {variant === "panel" ? (
        <>
          <button
            type="button"
            disabled={isPreviewReadonly}
            onClick={() => setDialog("set_date")}
            className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-55`}
          >
            Set follow-up date
          </button>
          <DirectFollowUpForm
            leadId={lead.id}
            redirectTo={redirectTo}
            actionType="clear"
            label="Clear follow-up"
            pendingLabel="Clearing..."
            disabled={isPreviewReadonly || !lead.nextFollowUpDate}
            className={buttonClass}
          />
        </>
      ) : null}

      {dialog ? (
        <FollowUpDialog
          dialog={dialog}
          lead={lead}
          redirectTo={redirectTo}
          defaultNextFollowUpOption={defaultNextFollowUpOption}
          isPreviewReadonly={isPreviewReadonly}
          onClose={() => setDialog(null)}
        />
      ) : null}
    </div>
  );
}

function DirectFollowUpForm({
  leadId,
  redirectTo,
  actionType,
  label,
  pendingLabel,
  disabled,
  className
}: {
  leadId: string;
  redirectTo: string;
  actionType: "clear";
  label: string;
  pendingLabel: string;
  disabled: boolean;
  className: string;
}) {
  return (
    <form action={updateFollowUpQueue}>
      <input type="hidden" name="leadId" value={leadId} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <input type="hidden" name="actionType" value={actionType} />
      <FollowUpSubmitButton disabled={disabled} pendingLabel={pendingLabel} className={className}>
        {label}
      </FollowUpSubmitButton>
    </form>
  );
}

function FollowUpDialog({
  dialog,
  lead,
  redirectTo,
  defaultNextFollowUpOption,
  isPreviewReadonly,
  onClose
}: {
  dialog: DialogType;
  lead: LeadWithProperties;
  redirectTo: string;
  defaultNextFollowUpOption: FollowUpDefaultOption;
  isPreviewReadonly: boolean;
  onClose: () => void;
}) {
  const initialNextChoice =
    dialog === "snooze" || dialog === "no_answer"
      ? defaultNextFollowUpOption === "none"
        ? "tomorrow"
        : defaultNextFollowUpOption
      : defaultNextFollowUpOption;
  const [nextChoice, setNextChoice] = useState<string>(initialNextChoice);
  const title =
    dialog === "followed_up"
      ? "Log follow-up"
      : dialog === "snooze"
        ? "Snooze follow-up"
        : dialog === "no_answer"
          ? "Log no answer"
        : dialog === "set_date"
          ? "Set follow-up date"
          : "Add follow-up note";

  return (
    <div className="fixed inset-0 z-[90] bg-slate-950/20 px-4 py-4 backdrop-blur-[2px]" role="presentation">
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default"
        aria-label="Close follow-up action"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute bottom-4 left-4 right-4 rounded-3xl border border-line/80 bg-white p-4 shadow-panel sm:left-auto sm:w-[440px]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="app-kicker">Follow-Up Queue</p>
            <h4 className="mt-1 text-lg font-semibold text-ink">{title}</h4>
            <p className="mt-1 text-sm text-slate-500">{lead.fullName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:border-accent hover:text-accent"
          >
            Close
          </button>
        </div>

        <form action={updateFollowUpQueue} className="mt-4 grid gap-3">
          <input type="hidden" name="leadId" value={lead.id} />
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <input type="hidden" name="actionType" value={dialog} />

          {dialog === "followed_up" ? (
            <>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Result</span>
                <select name="result" required defaultValue="" className="app-input bg-white text-ink">
                  <option value="" disabled>
                    Choose result
                  </option>
                  {resultOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <NextFollowUpField
                options={nextFollowUpOptions}
                value={nextChoice}
                onChange={setNextChoice}
              />
              <NoteField placeholder="Short note about the follow-up." />
              <DialogSubmitButton disabled={isPreviewReadonly} pendingLabel="Saving...">
                Save follow-up
              </DialogSubmitButton>
            </>
          ) : null}

          {dialog === "snooze" ? (
            <>
              <NextFollowUpField
                options={snoozeOptions}
                value={nextChoice}
                onChange={setNextChoice}
                label="Snooze until"
              />
              <NoteField placeholder="Optional reason or context." />
              <DialogSubmitButton disabled={isPreviewReadonly} pendingLabel="Snoozing...">
                Snooze follow-up
              </DialogSubmitButton>
            </>
          ) : null}

          {dialog === "no_answer" ? (
            <>
              <NextFollowUpField
                options={snoozeOptions}
                value={nextChoice}
                onChange={setNextChoice}
                label="Try again"
              />
              <NoteField placeholder="Optional call context." />
              <DialogSubmitButton disabled={isPreviewReadonly} pendingLabel="Logging...">
                Log no answer
              </DialogSubmitButton>
            </>
          ) : null}

          {dialog === "add_note" ? (
            <>
              <NoteField required placeholder="Add a quick internal note." />
              <DialogSubmitButton disabled={isPreviewReadonly} pendingLabel="Saving...">
                Save note
              </DialogSubmitButton>
            </>
          ) : null}

          {dialog === "set_date" ? (
            <>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Next follow-up date</span>
                <input
                  type="date"
                  name="customDate"
                  required
                  defaultValue={lead.nextFollowUpDate}
                  className="app-input bg-white text-ink"
                />
              </label>
              <DialogSubmitButton disabled={isPreviewReadonly} pendingLabel="Saving...">
                Set follow-up
              </DialogSubmitButton>
            </>
          ) : null}
        </form>
      </div>
    </div>
  );
}

function NextFollowUpField({
  options,
  value,
  onChange,
  label = "Next follow-up"
}: {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  return (
    <>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <select
          name="nextFollowUp"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="app-input bg-white text-ink"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      {value === "custom" ? (
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Custom date</span>
          <input type="date" name="customDate" required className="app-input bg-white text-ink" />
        </label>
      ) : null}
    </>
  );
}

function NoteField({
  required = false,
  placeholder
}: {
  required?: boolean;
  placeholder: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-700">Note</span>
      <textarea
        name="note"
        rows={3}
        required={required}
        maxLength={1200}
        className="app-textarea"
        placeholder={placeholder}
      />
    </label>
  );
}

function FollowUpSubmitButton({
  children,
  disabled,
  pendingLabel,
  className
}: {
  children: React.ReactNode;
  disabled: boolean;
  pendingLabel: string;
  className: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-55`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

function DialogSubmitButton({
  children,
  disabled,
  pendingLabel
}: {
  children: React.ReactNode;
  disabled: boolean;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending}
      className="app-button-primary justify-self-start disabled:cursor-not-allowed disabled:opacity-55"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
