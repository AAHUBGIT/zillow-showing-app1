"use client";

import { useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { AutoResizeTextarea } from "@/components/auto-resize-textarea";
import { CalendarLinkButton } from "@/components/calendar-link-button";
import { DateTimePickerFields, DateTimePickerHandle } from "@/components/date-time-picker-fields";
import { InlineSpinner } from "@/components/inline-spinner";
import { TooltipShell } from "@/components/tooltip-shell";
import { emitAppToast } from "@/lib/client-toast";
import { updateLeadSchedule } from "@/lib/actions";
import { buildGoogleCalendarUrlFromDraft } from "@/lib/calendar";
import {
  fieldMaxLengths,
  getMaxLengthError,
  getOptionalDateError,
  getRequiredSelectError
} from "@/lib/form-validation";
import {
  getPriorityLabel,
  getSourceLabel,
  getStatusLabel,
  leadPriorityOptions,
  leadSourceOptions,
  leadStatusOptions
} from "@/lib/lead-utils";
import { Lead } from "@/lib/types";

type FieldErrors = Partial<Record<string, string>>;

type ScheduleFormValues = {
  status: string;
  priority: string;
  source: string;
  nextFollowUpDate: string;
  agentNotes: string;
};

const scheduleFieldOrder = ["status", "priority", "source", "nextFollowUpDate", "agentNotes"];

function getFieldError(name: keyof ScheduleFormValues, value: string) {
  switch (name) {
    case "status":
    case "priority":
    case "source":
      return getRequiredSelectError(value);
    case "nextFollowUpDate":
      return getOptionalDateError(value);
    case "agentNotes":
      return getMaxLengthError(value, fieldMaxLengths.agentNotes);
    default:
      return "";
  }
}

function buildErrors(values: ScheduleFormValues) {
  return Object.entries(values).reduce<FieldErrors>((current, [name, value]) => {
    const nextError = getFieldError(name as keyof ScheduleFormValues, value);

    if (!nextError) {
      return current;
    }

    return { ...current, [name]: nextError };
  }, {});
}

export function LeadScheduleForm({
  lead,
  isPreviewReadonly = false
}: {
  lead: Lead;
  isPreviewReadonly?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const scheduleRef = useRef<DateTimePickerHandle>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [values, setValues] = useState<ScheduleFormValues>({
    status: lead.status,
    priority: lead.priority,
    source: lead.source,
    nextFollowUpDate: lead.nextFollowUpDate,
    agentNotes: lead.agentNotes
  });
  const [scheduleState, setScheduleState] = useState({
    date: lead.showingDate,
    time: lead.showingTime,
    isValid: true,
    isPastDate: false
  });

  const calendarUrl =
    scheduleState.date && scheduleState.time && scheduleState.isValid
      ? buildGoogleCalendarUrlFromDraft({
          ...lead,
          showingDate: scheduleState.date,
          showingTime: scheduleState.time,
          status: values.status as Lead["status"],
          priority: values.priority as Lead["priority"],
          source: values.source as Lead["source"],
          nextFollowUpDate: values.nextFollowUpDate,
          agentNotes: values.agentNotes
        })
      : null;

  const isFormValid = useMemo(
    () => Object.keys(buildErrors(values)).length === 0 && scheduleState.isValid,
    [scheduleState.isValid, values]
  );

  function updateField(name: keyof ScheduleFormValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }));

    const nextError = getFieldError(name, value);
    setErrors((current) => {
      if (!nextError) {
        const { [name]: _ignored, ...rest } = current;
        return rest;
      }

      return { ...current, [name]: nextError };
    });
  }

  function focusFirstInvalid(nextErrors: FieldErrors) {
    for (const name of scheduleFieldOrder) {
      if (nextErrors[name]) {
        const field = formRef.current?.querySelector<HTMLElement>(`[data-field="${name}"]`);
        field?.focus();
        return;
      }
    }

    scheduleRef.current?.focusDate();
  }

  function validateForm() {
    const nextErrors = buildErrors(values);
    const isScheduleValid = scheduleRef.current?.validate() ?? true;

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      emitAppToast({ toastKey: "validation-error" });
      focusFirstInvalid(nextErrors);
      return false;
    }

    if (!isScheduleValid) {
      emitAppToast({ toastKey: "validation-error" });
      scheduleRef.current?.focusDate();
      return false;
    }

    return true;
  }

  return (
    <form
      ref={formRef}
      action={updateLeadSchedule}
      noValidate
      onSubmit={(event) => {
        if (!validateForm()) {
          event.preventDefault();
        }
      }}
      className="mt-5 grid gap-4"
    >
      <input type="hidden" name="id" value={lead.id} />

      <ValidatedSelect
        label="Status"
        name="status"
        value={values.status}
        options={leadStatusOptions.map((option) => ({
          value: option,
          label: getStatusLabel(option)
        }))}
        error={errors.status}
        onChange={updateField}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <ValidatedSelect
          label="Priority"
          name="priority"
          value={values.priority}
          options={leadPriorityOptions.map((option) => ({
            value: option,
            label: getPriorityLabel(option)
          }))}
          error={errors.priority}
          onChange={updateField}
        />

        <ValidatedSelect
          label="Lead source"
          name="source"
          value={values.source}
          options={leadSourceOptions.map((option) => ({
            value: option,
            label: getSourceLabel(option)
          }))}
          error={errors.source}
          onChange={updateField}
        />
      </div>

      <DateTimePickerFields
        ref={scheduleRef}
        dateName="showingDate"
        timeName="showingTime"
        allowPastDateOverrideName="showingDateAllowPastOverride"
        dateLabel="Showing date"
        timeLabel="Showing time"
        dateAriaLabel="showing date"
        timeAriaLabel="showing time"
        initialDate={lead.showingDate}
        initialTime={lead.showingTime}
        onValueChange={setScheduleState}
      />

      <label className="flex min-w-0 flex-col gap-2">
        <span className="text-sm font-medium text-slate-700">Next follow-up date</span>
        <input
          type="date"
          name="nextFollowUpDate"
          value={values.nextFollowUpDate}
          data-field="nextFollowUpDate"
          aria-label="Next follow-up date"
          aria-invalid={Boolean(errors.nextFollowUpDate)}
          aria-describedby={
            errors.nextFollowUpDate
              ? "nextFollowUpDate-help nextFollowUpDate-error"
              : "nextFollowUpDate-help"
          }
          onChange={(event) => updateField("nextFollowUpDate", event.target.value)}
          className={`app-input ${
            errors.nextFollowUpDate ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""
          }`}
        />
        <p id="nextFollowUpDate-help" className="text-xs text-slate-500">
          Optional. Keeps the dashboard follow-up badges current.
        </p>
        <p
          id="nextFollowUpDate-error"
          className="min-h-[1.25rem] text-xs font-medium text-rose-600"
          aria-live="polite"
        >
          {errors.nextFollowUpDate || ""}
        </p>
      </label>

      <label className="flex min-w-0 flex-col gap-2">
        <span className="text-sm font-medium text-slate-700">Agent notes</span>
        <AutoResizeTextarea
          name="agentNotes"
          rows={5}
          value={values.agentNotes}
          maxLength={fieldMaxLengths.agentNotes}
          data-field="agentNotes"
          aria-label="Agent notes"
          aria-invalid={Boolean(errors.agentNotes)}
          aria-describedby={errors.agentNotes ? "agentNotes-help agentNotes-error" : "agentNotes-help"}
          onChange={(event) => updateField("agentNotes", event.target.value)}
          className={`app-textarea ${errors.agentNotes ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""}`}
        />
        <p id="agentNotes-help" className="text-xs text-slate-500">
          Use this for access notes, parking tips, or showing reminders.
        </p>
        <p id="agentNotes-error" className="min-h-[1.25rem] text-xs font-medium text-rose-600" aria-live="polite">
          {errors.agentNotes || ""}
        </p>
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex flex-col gap-2">
          {!isFormValid ? (
            <p className="text-xs font-medium text-slate-500">
              Fix the highlighted fields before saving updates.
            </p>
          ) : null}
          <TooltipShell
            disabled={isPreviewReadonly}
            message="Preview mode is read-only. Disable preview mode or use a live database to update leads."
          >
            <UpdateLeadButton disabled={isPreviewReadonly || !isFormValid} />
          </TooltipShell>
        </div>
        <CalendarLinkButton
          calendarUrl={calendarUrl}
          missingMessage="Add a valid showing date and time to enable Google Calendar."
        />
      </div>
    </form>
  );
}

function UpdateLeadButton({ disabled = false }: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="app-button-primary disabled:cursor-not-allowed disabled:opacity-55"
    >
      {pending ? (
        <>
          <InlineSpinner />
          <span>Saving Update...</span>
        </>
      ) : (
        "Update Lead"
      )}
    </button>
  );
}

function ValidatedSelect({
  label,
  name,
  value,
  options,
  error,
  onChange
}: {
  label: string;
  name: keyof ScheduleFormValues;
  value: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
  onChange: (name: keyof ScheduleFormValues, value: string) => void;
}) {
  const helpId = `${name}-help`;
  const errorId = `${name}-error`;

  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select
        name={name}
        value={value}
        data-field={name}
        aria-label={label}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${helpId} ${errorId}` : helpId}
        onChange={(event) => onChange(name, event.target.value)}
        className={`app-input ${error ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <p id={helpId} className="text-xs text-slate-500">
        Required field.
      </p>
      <p id={errorId} className="min-h-[1.25rem] text-xs font-medium text-rose-600" aria-live="polite">
        {error || ""}
      </p>
    </label>
  );
}
