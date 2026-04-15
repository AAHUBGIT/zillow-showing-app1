"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { CalendarLinkButton } from "@/components/calendar-link-button";
import { DateTimePickerFields, DateTimePickerHandle } from "@/components/date-time-picker-fields";
import { TooltipShell } from "@/components/tooltip-shell";
import { updateLeadSchedule } from "@/lib/actions";
import { buildGoogleCalendarUrl } from "@/lib/calendar";
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

const scheduleFieldOrder = ["status", "priority", "source"];

function getFieldError(name: string, value: string) {
  if (!value.trim()) {
    return "Please choose an option.";
  }

  return "";
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
  const [scheduleValues, setScheduleValues] = useState({
    date: lead.showingDate,
    time: lead.showingTime
  });

  const calendarUrl = buildGoogleCalendarUrl({
    ...lead,
    showingDate: scheduleValues.date,
    showingTime: scheduleValues.time
  });

  function setFieldError(name: string, value: string) {
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
    const formElement = formRef.current;
    if (!formElement) {
      return true;
    }

    const formData = new FormData(formElement);
    const nextErrors: FieldErrors = {};

    for (const name of scheduleFieldOrder) {
      const value = String(formData.get(name) ?? "");
      const nextError = getFieldError(name, value);

      if (nextError) {
        nextErrors[name] = nextError;
      }
    }

    const isScheduleValid = scheduleRef.current?.validate() ?? true;
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      focusFirstInvalid(nextErrors);
      return false;
    }

    if (!isScheduleValid) {
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
        defaultValue={lead.status}
        options={leadStatusOptions.map((option) => ({
          value: option,
          label: getStatusLabel(option)
        }))}
        errors={errors}
        onBlur={setFieldError}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <ValidatedSelect
          label="Priority"
          name="priority"
          defaultValue={lead.priority}
          options={leadPriorityOptions.map((option) => ({
            value: option,
            label: getPriorityLabel(option)
          }))}
          errors={errors}
          onBlur={setFieldError}
        />

        <ValidatedSelect
          label="Lead source"
          name="source"
          defaultValue={lead.source}
          options={leadSourceOptions.map((option) => ({
            value: option,
            label: getSourceLabel(option)
          }))}
          errors={errors}
          onBlur={setFieldError}
        />
      </div>

      <DateTimePickerFields
        ref={scheduleRef}
        dateName="showingDate"
        timeName="showingTime"
        dateLabel="Showing date"
        timeLabel="Showing time"
        dateAriaLabel="showing date"
        timeAriaLabel="showing time"
        initialDate={lead.showingDate}
        initialTime={lead.showingTime}
        onValueChange={setScheduleValues}
      />

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700">Next follow-up date</span>
        <input
          type="date"
          name="nextFollowUpDate"
          defaultValue={lead.nextFollowUpDate}
          aria-label="Next follow-up date"
          className="app-input"
        />
        <p className="text-xs text-slate-500">Optional. Keeps the dashboard follow-up badges current.</p>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700">Agent notes</span>
        <textarea
          name="agentNotes"
          rows={5}
          defaultValue={lead.agentNotes}
          aria-label="Agent notes"
          className="app-textarea"
        />
        <p className="text-xs text-slate-500">Use this for access notes, parking tips, or showing reminders.</p>
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <TooltipShell
          disabled={isPreviewReadonly}
          message="Preview mode is read-only. Disable preview mode or use a live database to update leads."
        >
          <UpdateLeadButton disabled={isPreviewReadonly} />
        </TooltipShell>
        <CalendarLinkButton
          calendarUrl={calendarUrl}
          missingMessage="Add both a showing date and showing time to enable Google Calendar."
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
      {pending ? "Saving..." : "Update Lead"}
    </button>
  );
}

function ValidatedSelect({
  label,
  name,
  defaultValue,
  options,
  errors,
  onBlur
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
  errors: FieldErrors;
  onBlur: (name: string, value: string) => void;
}) {
  const error = errors[name];
  const helpId = `${name}-help`;
  const errorId = `${name}-error`;

  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        data-field={name}
        aria-label={label}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${helpId} ${errorId}` : helpId}
        onBlur={(event) => onBlur(name, event.target.value)}
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
