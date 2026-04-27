"use client";

import { useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { AutoResizeTextarea } from "@/components/auto-resize-textarea";
import { CalendarLinkButton } from "@/components/calendar-link-button";
import { DateInputField } from "@/components/date-input-field";
import { DateTimePickerFields, DateTimePickerHandle } from "@/components/date-time-picker-fields";
import { InlineSpinner } from "@/components/inline-spinner";
import { TooltipShell } from "@/components/tooltip-shell";
import { emitAppToast } from "@/lib/client-toast";
import { createLead } from "@/lib/actions";
import { buildGoogleCalendarUrlFromDraft } from "@/lib/calendar";
import {
  fieldMaxLengths,
  getEmailError,
  getMaxLengthError,
  getOptionalDateError,
  getPhoneError,
  getRequiredSelectError,
  getRequiredTextError
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

type LeadFormValues = {
  fullName: string;
  phone: string;
  email: string;
  propertyAddress: string;
  desiredMoveInDate: string;
  nextFollowUpDate: string;
  status: string;
  priority: string;
  source: string;
  notes: string;
  agentNotes: string;
};

const initialFormValues: LeadFormValues = {
  fullName: "",
  phone: "",
  email: "",
  propertyAddress: "",
  desiredMoveInDate: "",
  nextFollowUpDate: "",
  status: "new",
  priority: "medium",
  source: "other",
  notes: "",
  agentNotes: ""
};

function getFieldError(name: keyof LeadFormValues, value: string) {
  switch (name) {
    case "fullName":
      return getRequiredTextError(value) || getMaxLengthError(value, fieldMaxLengths.fullName);
    case "phone":
      return getPhoneError(value) || getMaxLengthError(value, fieldMaxLengths.phone);
    case "email":
      return getEmailError(value) || getMaxLengthError(value, fieldMaxLengths.email);
    case "propertyAddress":
      return (
        getRequiredTextError(value) || getMaxLengthError(value, fieldMaxLengths.propertyAddress)
      );
    case "desiredMoveInDate":
      return getRequiredTextError(value);
    case "nextFollowUpDate":
      return getOptionalDateError(value);
    case "status":
    case "priority":
    case "source":
      return getRequiredSelectError(value);
    case "notes":
      return getMaxLengthError(value, fieldMaxLengths.notes);
    case "agentNotes":
      return getMaxLengthError(value, fieldMaxLengths.agentNotes);
    default:
      return "";
  }
}

function buildErrors(values: LeadFormValues) {
  return Object.entries(values).reduce<FieldErrors>((current, [name, value]) => {
    const nextError = getFieldError(name as keyof LeadFormValues, value);

    if (!nextError) {
      return current;
    }

    return { ...current, [name]: nextError };
  }, {});
}

export function NewLeadForm({ isPreviewReadonly = false }: { isPreviewReadonly?: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const scheduleRef = useRef<DateTimePickerHandle>(null);
  const [values, setValues] = useState<LeadFormValues>(initialFormValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [scheduleState, setScheduleState] = useState({
    date: "",
    time: "",
    isValid: true,
    isPastDate: false
  });

  const isFormValid = useMemo(
    () => Object.keys(buildErrors(values)).length === 0 && scheduleState.isValid,
    [scheduleState.isValid, values]
  );
  const calendarUrl =
    scheduleState.date && scheduleState.time && scheduleState.isValid
      ? buildGoogleCalendarUrlFromDraft({
          ...values,
          status: values.status as Lead["status"],
          priority: values.priority as Lead["priority"],
          source: values.source as Lead["source"],
          showingDate: scheduleState.date,
          showingTime: scheduleState.time
        })
      : null;

  function updateField(name: keyof LeadFormValues, value: string) {
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

  function validateForm() {
    const nextErrors = buildErrors(values);
    const isScheduleValid = scheduleRef.current?.validate() ?? true;

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      emitAppToast({ toastKey: "validation-error" });
      return false;
    }

    if (!isScheduleValid) {
      emitAppToast({ toastKey: "validation-error" });
      return false;
    }

    return true;
  }

  return (
    <form
      ref={formRef}
      action={createLead}
      noValidate
      onSubmit={(event) => {
        if (!validateForm()) {
          event.preventDefault();
        }
      }}
      className="mt-8 grid gap-5 sm:grid-cols-2"
    >
      <ValidatedField
        label="Full name"
        name="fullName"
        type="text"
        required
        autoComplete="name"
        value={values.fullName}
        error={errors.fullName}
        maxLength={fieldMaxLengths.fullName}
        onChange={updateField}
      />
      <ValidatedField
        label="Phone"
        name="phone"
        type="tel"
        required
        autoComplete="tel"
        value={values.phone}
        error={errors.phone}
        maxLength={fieldMaxLengths.phone}
        onChange={updateField}
      />
      <ValidatedField
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="email"
        value={values.email}
        error={errors.email}
        maxLength={fieldMaxLengths.email}
        onChange={updateField}
      />
      <ValidatedField
        label="Property address"
        name="propertyAddress"
        type="text"
        required
        autoComplete="street-address"
        value={values.propertyAddress}
        error={errors.propertyAddress}
        maxLength={fieldMaxLengths.propertyAddress}
        onChange={updateField}
      />
      <DateInputField
        label="Desired move-in date"
        name="desiredMoveInDate"
        required
        value={values.desiredMoveInDate}
        error={errors.desiredMoveInDate}
        dataField="desiredMoveInDate"
        helperText="Use MM/DD/YYYY"
        onChange={(value) => updateField("desiredMoveInDate", value)}
      />
      <DateInputField
        label="Next follow-up date"
        name="nextFollowUpDate"
        value={values.nextFollowUpDate}
        error={errors.nextFollowUpDate}
        dataField="nextFollowUpDate"
        helperText="Use MM/DD/YYYY"
        onChange={(value) => updateField("nextFollowUpDate", value)}
      />

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

      <div className="rounded-3xl border border-line/70 bg-slate-50/80 px-4 py-4">
        <p className="app-kicker">Lead Quality</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Use priority and follow-up date to keep urgent inquiries and time-sensitive leads near
          the top of the dashboard.
        </p>
      </div>

      <div className="sm:col-span-2">
        <ValidatedTextarea
          label="Notes"
          name="notes"
          rows={4}
          placeholder="Example: Prefers first-floor units, works downtown, wants parking."
          value={values.notes}
          error={errors.notes}
          maxLength={fieldMaxLengths.notes}
          onChange={updateField}
        />
      </div>

      <div className="sm:col-span-2 app-subpanel p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Optional first showing setup</p>
            <p className="mt-1 text-sm text-slate-600">
              Capture the showing now if you already have a scheduled tour.
            </p>
          </div>
          <div className="app-chip">Optional</div>
        </div>

        <div className="mt-5">
          <DateTimePickerFields
            ref={scheduleRef}
            dateName="showingDate"
            timeName="showingTime"
            allowPastDateOverrideName="showingDateAllowPastOverride"
            dateLabel="Showing date"
            timeLabel="Showing time"
            dateAriaLabel="showing date"
            timeAriaLabel="showing time"
            onValueChange={setScheduleState}
          />
        </div>

        <div className="mt-5">
          <ValidatedTextarea
            label="Agent notes"
            name="agentNotes"
            rows={3}
            placeholder="Lockbox code, parking tips, pet policy reminders, and so on."
            value={values.agentNotes}
            error={errors.agentNotes}
            maxLength={fieldMaxLengths.agentNotes}
            onChange={updateField}
          />
        </div>
      </div>

      <div className="sm:col-span-2 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-600">Create a record with real context</p>
          <p className="mt-1 text-sm text-slate-500">
            Priority, source, and follow-up timing help the dashboard rank the lead intelligently.
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          {!isFormValid ? (
            <p className="text-xs font-medium text-slate-500">
              Complete the required fields and fix any errors to enable save.
            </p>
          ) : null}
          <CalendarLinkButton
            calendarUrl={calendarUrl}
            missingMessage="Add the lead name, phone, email, property address, showing date, and showing time to open Google Calendar before saving."
          />
          <TooltipShell
            disabled={isPreviewReadonly}
            message="This preview workspace is read-only. Use a live workspace to create leads."
          >
            <CreateLeadButton disabled={isPreviewReadonly || !isFormValid} />
          </TooltipShell>
        </div>
      </div>
    </form>
  );
}

function CreateLeadButton({ disabled = false }: { disabled?: boolean }) {
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
          <span>Saving Lead...</span>
        </>
      ) : (
        "Create Lead"
      )}
    </button>
  );
}

function ValidatedField({
  label,
  name,
  type = "text",
  required = false,
  value,
  error,
  onChange,
  autoComplete,
  maxLength
}: {
  label: string;
  name: keyof LeadFormValues;
  type?: string;
  required?: boolean;
  value: string;
  error?: string;
  onChange: (name: keyof LeadFormValues, value: string) => void;
  autoComplete?: string;
  maxLength?: number;
}) {
  const helpId = `${name}-help`;
  const errorId = `${name}-error`;

  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        name={name}
        required={required}
        autoComplete={autoComplete}
        maxLength={maxLength}
        value={value}
        data-field={name}
        aria-label={label}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${helpId} ${errorId}` : helpId}
        onChange={(event) => onChange(name, event.target.value)}
        className={`app-input ${error ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""}`}
      />
      <p id={helpId} className="text-xs text-slate-500">
        {required ? "Required field." : "Optional field."}
      </p>
      <FieldError id={errorId} message={error} />
    </label>
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
  name: keyof LeadFormValues;
  value: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
  onChange: (name: keyof LeadFormValues, value: string) => void;
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
      <FieldError id={errorId} message={error} />
    </label>
  );
}

function ValidatedTextarea({
  label,
  name,
  rows,
  placeholder,
  value,
  error,
  onChange,
  maxLength
}: {
  label: string;
  name: keyof LeadFormValues;
  rows: number;
  placeholder: string;
  value: string;
  error?: string;
  onChange: (name: keyof LeadFormValues, value: string) => void;
  maxLength: number;
}) {
  const helpId = `${name}-help`;
  const errorId = `${name}-error`;

  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <AutoResizeTextarea
        name={name}
        rows={rows}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        data-field={name}
        aria-label={label}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${helpId} ${errorId}` : helpId}
        onChange={(event) => onChange(name, event.target.value)}
        className={`app-textarea ${error ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""}`}
      />
      <p id={helpId} className="text-xs text-slate-500">
        Optional field.
      </p>
      <FieldError id={errorId} message={error} />
    </label>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <p id={id} className="min-h-[1.25rem] text-xs font-medium text-rose-600" aria-live="polite">
      {message || ""}
    </p>
  );
}
